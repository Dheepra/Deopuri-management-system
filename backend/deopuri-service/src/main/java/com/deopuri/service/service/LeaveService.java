package com.deopuri.service.service;

import com.deopuri.api.dto.LeaveBalanceResponse;
import com.deopuri.api.dto.LeaveRequest;
import com.deopuri.api.dto.LeaveResponse;

import java.util.List;

/**
 * Leave apply / view / balance for the currently authenticated worker — works for both STAFF and
 * DOCTOR logins. The applicant and their approving hospital admin are resolved from the JWT.
 */
public interface LeaveService {

    LeaveResponse applyLeave(LeaveRequest request);

    List<LeaveResponse> getMyLeaves();

    LeaveBalanceResponse getMyBalance();
}
