package com.deopuri.service.service.impl;

import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.model.Doctor;
import com.deopuri.api.model.LeaveApplication;
import com.deopuri.api.model.LeaveStatus;
import com.deopuri.api.model.LeaveType;
import com.deopuri.api.model.Staff;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.DoctorDao;
import com.deopuri.service.dao.LeaveDao;
import com.deopuri.service.dao.StaffDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.LeaveService;
import com.deopuri.service.service.NotificationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveServiceImpl implements LeaveService {

    static final int CASUAL_TOTAL = 12;

    private final UsersDao usersDao;
    private final StaffDao staffDao;
    private final DoctorDao doctorDao;
    private final LeaveDao leaveDao;
    private final NotificationService notificationService;

    public LeaveServiceImpl(
            UsersDao usersDao,
            StaffDao staffDao,
            DoctorDao doctorDao,
            LeaveDao leaveDao,
            NotificationService notificationService) {
        this.usersDao = usersDao;
        this.staffDao = staffDao;
        this.doctorDao = doctorDao;
        this.leaveDao = leaveDao;
        this.notificationService = notificationService;
    }

    // Who is applying and which hospital admin approves — resolved from the JWT for staff or doctor.
    private record Applicant(Users user, Users hospitalAdmin, String name) {
    }

    private Applicant currentApplicant() {
        Users me = usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Not authenticated"));

        Optional<Staff> staff = staffDao.findByUser_Id(me.getId());
        if (staff.isPresent()) {
            return new Applicant(me, staff.get().getHospitalAdmin(), staff.get().getName());
        }

        Optional<Doctor> doctor = doctorDao.findByUserId(me.getId());
        if (doctor.isPresent()) {
            String name = fullName(me);
            return new Applicant(me, doctor.get().getHospitalAdmin(), name);
        }

        throw new AccessDeniedException("Only staff or doctors can apply for leave");
    }

    private static String fullName(Users u) {
        String first = u.getFirstName() == null ? "" : u.getFirstName();
        String last = u.getLastName() == null ? "" : u.getLastName();
        return (first + " " + last).trim();
    }

    @Override
    @Transactional
    public LeaveResponse applyLeave(LeaveRequest req) {
        Applicant me = currentApplicant();

        if (req.fromDate().isAfter(req.toDate())) {
            throw new BusinessException("bad_dates", "From date must be on or before to date");
        }

        int days = (int) (ChronoUnit.DAYS.between(req.fromDate(), req.toDate()) + 1);

        if (req.type() == LeaveType.CASUAL) {
            int casualUsed = computeBalance(me.user().getId()).casualUsed();
            if (casualUsed + days > CASUAL_TOTAL) {
                throw new BusinessException("casual_exhausted", "Not enough casual leave balance");
            }
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setApplicantUser(me.user());
        leave.setHospitalAdmin(me.hospitalAdmin());
        leave.setApplicantName(me.name());
        leave.setType(req.type());
        leave.setFromDate(req.fromDate());
        leave.setToDate(req.toDate());
        leave.setDays(days);
        leave.setReason(req.reason());
        leave.setStatus(LeaveStatus.PENDING);
        LeaveApplication saved = leaveDao.save(leave);

        if (me.hospitalAdmin() != null) {
            notificationService.saveNotification(
                    "Leave request",
                    me.name() + " applied for " + req.type() + " leave (" + days + "d)",
                    me.hospitalAdmin().getId());
        }

        return toLeaveResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getMyLeaves() {
        Applicant me = currentApplicant();
        return leaveDao.findByApplicantUser_IdOrderByCreatedTimeDesc(me.user().getId())
                .stream()
                .map(LeaveServiceImpl::toLeaveResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveBalanceResponse getMyBalance() {
        Applicant me = currentApplicant();
        return computeBalance(me.user().getId());
    }

    // ---- shared helpers (also used by the staff dashboard) ----

    LeaveBalanceResponse computeBalance(int applicantUserId) {
        int year = LocalDate.now().getYear();
        EnumSet<LeaveStatus> active = EnumSet.of(LeaveStatus.APPROVED, LeaveStatus.PENDING);

        int casualUsed = sumDaysThisYear(applicantUserId, LeaveType.CASUAL, active, year);
        int sickUsed = sumDaysThisYear(applicantUserId, LeaveType.SICK, active, year);
        int unpaidUsed = sumDaysThisYear(applicantUserId, LeaveType.UNPAID, active, year);

        int casualRemaining = Math.max(0, CASUAL_TOTAL - casualUsed);
        return new LeaveBalanceResponse(CASUAL_TOTAL, casualUsed, casualRemaining, sickUsed, unpaidUsed);
    }

    int pendingCount(int applicantUserId) {
        return (int) leaveDao.findByApplicantUser_IdOrderByCreatedTimeDesc(applicantUserId)
                .stream()
                .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                .count();
    }

    private int sumDaysThisYear(int applicantUserId, LeaveType type, EnumSet<LeaveStatus> statuses, int year) {
        return leaveDao.findByApplicantUser_IdAndTypeAndStatusIn(applicantUserId, type, statuses)
                .stream()
                .filter(l -> l.getFromDate() != null && l.getFromDate().getYear() == year)
                .mapToInt(LeaveApplication::getDays)
                .sum();
    }

    static LeaveResponse toLeaveResponse(LeaveApplication l) {
        return new LeaveResponse(
                l.getId(),
                l.getType() != null ? l.getType().name() : null,
                l.getFromDate() != null ? l.getFromDate().toString() : null,
                l.getToDate() != null ? l.getToDate().toString() : null,
                l.getDays(),
                l.getReason(),
                l.getStatus() != null ? l.getStatus().name() : null,
                l.getApplicantName(),
                l.getCreatedTime() != null ? l.getCreatedTime().toString() : null);
    }
}
