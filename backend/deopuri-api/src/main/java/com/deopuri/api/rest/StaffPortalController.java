package com.deopuri.api.rest;

import com.deopuri.api.dto.AttendanceResponse;
import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.dto.StaffDashboardResponse;
import com.deopuri.api.dto.StaffProfileResponse;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RequestMapping("/deopuri/staff")
public interface StaffPortalController {

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/me")
    ResponseEntity<StaffProfileResponse> getMe();

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/attendance")
    ResponseEntity<AttendanceResponse> markToday();

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/attendance")
    ResponseEntity<List<AttendanceResponse>> getMyAttendance();

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/leave-balance")
    ResponseEntity<LeaveBalanceResponse> getLeaveBalance();

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/leaves")
    ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveRequest request);

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/leaves")
    ResponseEntity<List<LeaveResponse>> getMyLeaves();

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/dashboard")
    ResponseEntity<StaffDashboardResponse> getDashboard();
}
