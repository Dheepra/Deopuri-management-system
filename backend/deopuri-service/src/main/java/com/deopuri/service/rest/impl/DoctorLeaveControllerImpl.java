package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.rest.DoctorLeaveController;
import com.deopuri.service.service.LeaveService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DoctorLeaveControllerImpl implements DoctorLeaveController {

    private final LeaveService leaveService;

    public DoctorLeaveControllerImpl(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @Override
    public ResponseEntity<List<LeaveResponse>> getMyLeaves() {
        return ResponseEntity.ok(leaveService.getMyLeaves());
    }

    @Override
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.ok(leaveService.applyLeave(request));
    }

    @Override
    public ResponseEntity<LeaveBalanceResponse> getLeaveBalance() {
        return ResponseEntity.ok(leaveService.getMyBalance());
    }
}
