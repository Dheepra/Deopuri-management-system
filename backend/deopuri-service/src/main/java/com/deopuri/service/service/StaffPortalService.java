package com.deopuri.service.service;

import com.deopuri.api.dto.AttendanceResponse;
import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.dto.StaffDashboardResponse;
import com.deopuri.api.dto.StaffProfileResponse;

import java.util.List;

public interface StaffPortalService {

    StaffProfileResponse getMe();

    AttendanceResponse markToday();

    List<AttendanceResponse> getMyAttendance();

    LeaveBalanceResponse getLeaveBalance();

    LeaveResponse applyLeave(LeaveRequest req);

    List<LeaveResponse> getMyLeaves();

    StaffDashboardResponse getDashboard();
}
