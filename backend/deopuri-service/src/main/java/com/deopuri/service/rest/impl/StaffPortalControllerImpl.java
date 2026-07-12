package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.AttendanceResponse;
import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.dto.StaffDashboardResponse;
import com.deopuri.api.dto.StaffProfileResponse;
import com.deopuri.api.rest.StaffPortalController;
import com.deopuri.service.service.StaffPortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StaffPortalControllerImpl implements StaffPortalController {

    private final StaffPortalService staffPortalService;

    public StaffPortalControllerImpl(StaffPortalService staffPortalService) {
        this.staffPortalService = staffPortalService;
    }

    @Override
    public ResponseEntity<StaffProfileResponse> getMe() {
        return ResponseEntity.ok(staffPortalService.getMe());
    }

    @Override
    public ResponseEntity<AttendanceResponse> markToday() {
        return ResponseEntity.ok(staffPortalService.markToday());
    }

    @Override
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance() {
        return ResponseEntity.ok(staffPortalService.getMyAttendance());
    }

    @Override
    public ResponseEntity<LeaveBalanceResponse> getLeaveBalance() {
        return ResponseEntity.ok(staffPortalService.getLeaveBalance());
    }

    @Override
    public ResponseEntity<LeaveResponse> applyLeave(LeaveRequest request) {
        return ResponseEntity.ok(staffPortalService.applyLeave(request));
    }

    @Override
    public ResponseEntity<List<LeaveResponse>> getMyLeaves() {
        return ResponseEntity.ok(staffPortalService.getMyLeaves());
    }

    @Override
    public ResponseEntity<StaffDashboardResponse> getDashboard() {
        return ResponseEntity.ok(staffPortalService.getDashboard());
    }
}
