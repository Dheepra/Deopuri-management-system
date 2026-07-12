package com.deopuri.service.service;

import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.model.LeaveStatus;

import java.util.List;

public interface HospitalLeaveService {

    List<LeaveResponse> getStaffLeaves();

    LeaveResponse updateStatus(Long leaveId, LeaveStatus status);
}
