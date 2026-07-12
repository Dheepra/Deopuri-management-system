package com.deopuri.api.rest;

import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

/** Doctor self-service leave (apply / view / balance). Doctors share the user-based LeaveService. */
@RequestMapping("/deopuri/doctor")
public interface DoctorLeaveController {

    @GetMapping("/leaves")
    @PreAuthorize("hasRole('DOCTOR')")
    ResponseEntity<List<LeaveResponse>> getMyLeaves();

    @PostMapping("/leaves")
    @PreAuthorize("hasRole('DOCTOR')")
    ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveRequest request);

    @GetMapping("/leave-balance")
    @PreAuthorize("hasRole('DOCTOR')")
    ResponseEntity<LeaveBalanceResponse> getLeaveBalance();
}
