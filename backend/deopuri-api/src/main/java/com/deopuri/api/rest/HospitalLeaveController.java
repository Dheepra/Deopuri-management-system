package com.deopuri.api.rest;

import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.model.LeaveStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RequestMapping("/deopuri/hospital-admin")
public interface HospitalLeaveController {

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @GetMapping("/leaves")
    ResponseEntity<List<LeaveResponse>> getStaffLeaves();

    @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
    @PatchMapping("/leaves/{id}/status")
    ResponseEntity<LeaveResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam LeaveStatus status);
}
