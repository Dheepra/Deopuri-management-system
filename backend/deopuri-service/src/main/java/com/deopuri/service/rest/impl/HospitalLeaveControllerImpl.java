package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.model.LeaveStatus;
import com.deopuri.api.rest.HospitalLeaveController;
import com.deopuri.service.service.HospitalLeaveService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class HospitalLeaveControllerImpl implements HospitalLeaveController {

    private final HospitalLeaveService hospitalLeaveService;

    public HospitalLeaveControllerImpl(HospitalLeaveService hospitalLeaveService) {
        this.hospitalLeaveService = hospitalLeaveService;
    }

    @Override
    public ResponseEntity<List<LeaveResponse>> getStaffLeaves() {
        return ResponseEntity.ok(hospitalLeaveService.getStaffLeaves());
    }

    @Override
    public ResponseEntity<LeaveResponse> updateStatus(Long id, LeaveStatus status) {
        return ResponseEntity.ok(hospitalLeaveService.updateStatus(id, status));
    }
}
