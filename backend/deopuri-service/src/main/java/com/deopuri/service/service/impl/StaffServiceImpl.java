package com.deopuri.service.service.impl;

import com.deopuri.api.dto.StaffAttendanceRow;
import com.deopuri.api.dto.StaffRequest;
import com.deopuri.api.dto.StaffResponse;
import com.deopuri.api.model.LeaveApplication;
import com.deopuri.api.model.LeaveStatus;
import com.deopuri.api.model.Staff;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import com.deopuri.service.dao.AttendanceDao;
import com.deopuri.service.dao.LeaveDao;
import com.deopuri.service.dao.StaffDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.EmailService;
import com.deopuri.service.service.StaffService;
import com.deopuri.exception.EmailAlreadyRegisteredException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class StaffServiceImpl implements StaffService {

    private static final Logger log = LoggerFactory.getLogger(StaffServiceImpl.class);

    private final StaffDao staffDao;
    private final UsersDao usersDao;
    private final AttendanceDao attendanceDao;
    private final LeaveDao leaveDao;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public StaffServiceImpl(StaffDao staffDao,
            UsersDao usersDao,
            AttendanceDao attendanceDao,
            LeaveDao leaveDao,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.staffDao = staffDao;
        this.usersDao = usersDao;
        this.attendanceDao = attendanceDao;
        this.leaveDao = leaveDao;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Resolves the hospital admin from the JWT (current authenticated user's email).
    private Users currentHospitalAdmin() {
        return usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Not authorized"));
    }

    private StaffResponse toResponse(Staff staff) {
        String email = staff.getUser() != null ? staff.getUser().getEmail() : null;
        String mobileNo = staff.getUser() != null ? staff.getUser().getMobileNo() : null;
        return new StaffResponse(
                staff.getId(),
                staff.getName(),
                staff.getRole(),
                staff.getDepartment(),
                staff.getShift(),
                staff.getStatus(),
                email,
                mobileNo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffResponse> getMyStaff() {
        Users admin = currentHospitalAdmin();
        return staffDao.findByHospitalAdmin_Id(admin.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StaffResponse create(StaffRequest request) {
        Users admin = currentHospitalAdmin();

        String email = normalizeEmail(request.email());
        if (usersDao.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException("Email already in use");
        }

        // 1) Login identity (role STAFF) — mirrors the Doctor invite flow: random temp password +
        //    single-use invitation token, emailed as a create-password link.
        Users staffUser = new Users();
        staffUser.setFirstName(request.name());
        staffUser.setLastName("");
        staffUser.setEmail(email);
        staffUser.setMobileNo(request.mobileNo());
        staffUser.setRole(UserRole.STAFF);
        staffUser.setStatus(UserStatus.APPROVED);
        staffUser.setAddress("N/A");
        staffUser.setShopName("N/A");

        String tempPassword = "Dp@" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        staffUser.setPassword(passwordEncoder.encode(tempPassword));
        staffUser.setPasswordCreated(false);

        String invitationToken = UUID.randomUUID().toString();
        staffUser.setInvitationToken(invitationToken);

        staffUser = usersDao.save(staffUser);

        // 2) Staff record
        Staff staff = new Staff();
        staff.setName(request.name());
        staff.setRole(request.role());
        staff.setDepartment(request.department());
        staff.setShift(request.shift());
        staff.setStatus(
                (request.status() == null || request.status().isBlank())
                        ? "active"
                        : request.status());
        staff.setHospitalAdmin(admin);
        staff.setUser(staffUser);

        Staff saved = staffDao.save(staff);

        // 3) Invite email (best-effort — staff still created if mail fails).
        sendInvite(staffUser, tempPassword, invitationToken);

        return toResponse(saved);
    }

    @Override
    public StaffResponse update(Long id, StaffRequest request) {
        Users admin = currentHospitalAdmin();

        Staff staff = staffDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        // Users.getId() is a primitive int — compare with != , not .equals.
        if (staff.getHospitalAdmin().getId() != admin.getId()) {
            throw new AccessDeniedException("Not authorized");
        }

        staff.setName(request.name());
        staff.setRole(request.role());
        staff.setDepartment(request.department());
        staff.setShift(request.shift());
        staff.setStatus(
                (request.status() == null || request.status().isBlank())
                        ? "active"
                        : request.status());

        // Keep the login identity's display name and mobile in sync; email is not changed here.
        if (staff.getUser() != null) {
            staff.getUser().setFirstName(request.name());
            if (request.mobileNo() != null && !request.mobileNo().isBlank()) {
                staff.getUser().setMobileNo(request.mobileNo());
            }
        }

        return toResponse(staffDao.save(staff));
    }

    @Override
    public void delete(Long id) {
        Users admin = currentHospitalAdmin();

        Staff staff = staffDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        if (staff.getHospitalAdmin().getId() != admin.getId()) {
            throw new AccessDeniedException("Not authorized");
        }

        Users staffUser = staff.getUser();
        staffDao.delete(staff);
        // Remove the orphaned login identity too, so the email can be reused.
        if (staffUser != null) {
            usersDao.delete(staffUser);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffAttendanceRow> getAttendanceRoster(LocalDate date) {
        Users admin = currentHospitalAdmin();
        LocalDate day = (date != null) ? date : LocalDate.now();

        return staffDao.findByHospitalAdmin_Id(admin.getId()).stream()
                .map(staff -> {
                    String status;
                    if (attendanceDao.existsByStaff_IdAndDate(staff.getId(), day)) {
                        status = "PRESENT";
                    } else if (isOnApprovedLeave(staff, day)) {
                        status = "LEAVE";
                    } else {
                        status = "ABSENT";
                    }
                    return new StaffAttendanceRow(
                            staff.getId(), staff.getName(), staff.getDepartment(), status);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportAttendanceCsv(String month) {
        Users admin = currentHospitalAdmin();

        java.time.YearMonth ym;
        try {
            ym = (month != null && !month.isBlank())
                    ? java.time.YearMonth.parse(month.trim())
                    : java.time.YearMonth.now();
        } catch (Exception e) {
            throw new com.deopuri.exception.BusinessException("bad_month", "Month must be in yyyy-MM format");
        }

        LocalDate first = ym.atDay(1);
        LocalDate last = ym.atEndOfMonth();
        LocalDate today = LocalDate.now();
        int days = ym.lengthOfMonth();

        StringBuilder sb = new StringBuilder();
        // Header
        sb.append("Staff,Department,Present,Leave,Absent");
        for (int d = 1; d <= days; d++) {
            sb.append(',').append(d);
        }
        sb.append('\n');

        for (Staff staff : staffDao.findByHospitalAdmin_Id(admin.getId())) {
            java.util.Set<LocalDate> present = new java.util.HashSet<>();
            attendanceDao.findByStaff_IdAndDateBetween(staff.getId(), first, last)
                    .forEach(a -> present.add(a.getDate()));

            List<LeaveApplication> leaves = (staff.getUser() != null)
                    ? leaveDao.findByApplicantUser_IdAndStatus(staff.getUser().getId(), LeaveStatus.APPROVED)
                    : List.of();

            int p = 0, l = 0, ab = 0;
            StringBuilder dayCols = new StringBuilder();
            for (int d = 1; d <= days; d++) {
                LocalDate date = ym.atDay(d);
                String mark;
                if (date.isAfter(today)) {
                    mark = "-"; // future day, not yet happened
                } else if (present.contains(date)) {
                    mark = "P";
                    p++;
                } else if (coversDate(leaves, date)) {
                    mark = "L";
                    l++;
                } else {
                    mark = "A";
                    ab++;
                }
                dayCols.append(',').append(mark);
            }

            sb.append(csv(staff.getName())).append(',')
              .append(csv(staff.getDepartment())).append(',')
              .append(p).append(',').append(l).append(',').append(ab)
              .append(dayCols).append('\n');
        }

        return sb.toString();
    }

    private static boolean coversDate(List<LeaveApplication> leaves, LocalDate date) {
        return leaves.stream().anyMatch(l ->
                l.getFromDate() != null && l.getToDate() != null
                        && !date.isBefore(l.getFromDate()) && !date.isAfter(l.getToDate()));
    }

    private static String csv(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }

    // True if the staff member has an APPROVED leave whose date range covers `day`.
    private boolean isOnApprovedLeave(Staff staff, LocalDate day) {
        if (staff.getUser() == null) {
            return false;
        }
        return leaveDao
                .findByApplicantUser_IdAndStatus(staff.getUser().getId(), LeaveStatus.APPROVED)
                .stream()
                .anyMatch(l -> {
                    LeaveApplication leave = l;
                    LocalDate from = leave.getFromDate();
                    LocalDate to = leave.getToDate();
                    return from != null && to != null
                            && !day.isBefore(from) && !day.isAfter(to);
                });
    }

    private void sendInvite(Users staffUser, String tempPassword, String invitationToken) {
        try {
            String link = "http://localhost:5173/login?userId=" + staffUser.getId()
                    + "&token=" + invitationToken;
            String body = """
                    <div style="font-family:Arial,sans-serif; padding:20px; text-align:center;">
                      <div style="max-width:600px; margin:0 auto; border:1px solid #ddd; border-radius:10px; padding:20px; background:#ffffff;">
                        <img src='cid:logoImage' width='120' style="margin-bottom:15px;"/>
                        <h2 style="color:#2e7d32;">Deopuri Herbal Drugs and Pharmaceuticals</h2>
                        <hr style="width:60%%; margin:15px auto;"/>
                        <h2>Welcome to the team 👋</h2>
                        <p>Hello <b>%s</b>,</p>
                        <p>Your staff account has been created by your Hospital Admin. You can mark your
                           attendance and apply for leave from the staff portal.</p>
                        <div style="background:#f5f5f5; padding:15px; border-radius:8px; margin:20px auto;">
                          <p><b>Login Email:</b> %s</p>
                          <p><b>Temporary Password:</b> %s</p>
                        </div>
                        <p>Click below to create your password:</p>
                        <a href="%s" style="display:inline-block; background:#2e7d32; color:white; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold; margin-top:10px;">Create Password</a>
                        <br/><br/>
                        <p>Regards,<br/><b>Deopuri Team</b></p>
                      </div>
                    </div>
                    """.formatted(
                    staffUser.getFirstName(),
                    staffUser.getEmail(),
                    tempPassword,
                    link);
            emailService.sendEmail(staffUser.getEmail(), "Staff Account Created", body);
        } catch (Exception e) {
            log.error("Staff invite mail failed userId={}", staffUser.getId(), e);
        }
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
