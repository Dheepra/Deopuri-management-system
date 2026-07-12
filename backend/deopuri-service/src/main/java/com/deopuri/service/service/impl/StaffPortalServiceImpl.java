package com.deopuri.service.service.impl;

import com.deopuri.api.dto.AttendanceResponse;
import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.dto.StaffDashboardResponse;
import com.deopuri.api.dto.StaffProfileResponse;
import com.deopuri.api.model.Attendance;
import com.deopuri.api.model.Staff;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.AttendanceDao;
import com.deopuri.service.dao.StaffDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.LeaveService;
import com.deopuri.service.service.StaffPortalService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StaffPortalServiceImpl implements StaffPortalService {

    private final UsersDao usersDao;
    private final StaffDao staffDao;
    private final AttendanceDao attendanceDao;
    private final LeaveService leaveService;

    public StaffPortalServiceImpl(
            UsersDao usersDao,
            StaffDao staffDao,
            AttendanceDao attendanceDao,
            LeaveService leaveService) {
        this.usersDao = usersDao;
        this.staffDao = staffDao;
        this.attendanceDao = attendanceDao;
        this.leaveService = leaveService;
    }

    // Resolve the Staff record backing the currently authenticated staff login.
    private Staff currentStaff() {
        Users u = usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Not authenticated"));
        return staffDao.findByUser_Id(u.getId())
                .orElseThrow(() -> new AccessDeniedException("Not a staff account"));
    }

    @Override
    @Transactional(readOnly = true)
    public StaffProfileResponse getMe() {
        Staff staff = currentStaff();
        Users login = staff.getUser();
        return new StaffProfileResponse(
                staff.getId(),
                staff.getName(),
                staff.getRole(),
                staff.getDepartment(),
                staff.getShift(),
                staff.getStatus(),
                login != null ? login.getEmail() : null,
                login != null ? login.getMobileNo() : null);
    }

    @Override
    @Transactional
    public AttendanceResponse markToday() {
        Staff staff = currentStaff();
        LocalDate today = LocalDate.now();
        if (attendanceDao.existsByStaff_IdAndDate(staff.getId(), today)) {
            throw new BusinessException("already_marked", "Attendance already marked for today");
        }
        Attendance attendance = attendanceDao.save(
                new Attendance(staff, today, "PRESENT", LocalDateTime.now()));
        return toAttendanceResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendance() {
        Staff staff = currentStaff();
        return attendanceDao.findByStaff_IdOrderByDateDesc(staff.getId())
                .stream()
                .map(this::toAttendanceResponse)
                .toList();
    }

    // ---- leave: delegated to the shared user-based LeaveService ----

    @Override
    public LeaveBalanceResponse getLeaveBalance() {
        return leaveService.getMyBalance();
    }

    @Override
    public LeaveResponse applyLeave(LeaveRequest req) {
        return leaveService.applyLeave(req);
    }

    @Override
    public List<LeaveResponse> getMyLeaves() {
        return leaveService.getMyLeaves();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffDashboardResponse getDashboard() {
        Staff staff = currentStaff();
        LocalDate today = LocalDate.now();

        boolean todayMarked = attendanceDao.existsByStaff_IdAndDate(staff.getId(), today);

        int presentThisMonth = (int) attendanceDao.findByStaff_IdOrderByDateDesc(staff.getId())
                .stream()
                .filter(a -> a.getDate() != null
                        && a.getDate().getYear() == today.getYear()
                        && a.getDate().getMonthValue() == today.getMonthValue())
                .count();

        int casualRemaining = leaveService.getMyBalance().casualRemaining();

        int pendingLeaves = (int) leaveService.getMyLeaves()
                .stream()
                .filter(l -> "PENDING".equals(l.status()))
                .count();

        return new StaffDashboardResponse(todayMarked, presentThisMonth, casualRemaining, pendingLeaves);
    }

    private AttendanceResponse toAttendanceResponse(Attendance a) {
        return new AttendanceResponse(
                a.getDate() != null ? a.getDate().toString() : null,
                a.getStatus(),
                a.getMarkedAt() != null ? a.getMarkedAt().toString() : null);
    }
}
