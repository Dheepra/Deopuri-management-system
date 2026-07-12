package com.deopuri.service.service.impl;

import com.deopuri.api.dto.LeaveResponse;
import com.deopuri.api.model.LeaveApplication;
import com.deopuri.api.model.LeaveStatus;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.LeaveDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.HospitalLeaveService;
import com.deopuri.service.service.NotificationService;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HospitalLeaveServiceImpl implements HospitalLeaveService {

    private final UsersDao usersDao;
    private final LeaveDao leaveDao;
    private final NotificationService notificationService;

    public HospitalLeaveServiceImpl(
            UsersDao usersDao,
            LeaveDao leaveDao,
            NotificationService notificationService) {
        this.usersDao = usersDao;
        this.leaveDao = leaveDao;
        this.notificationService = notificationService;
    }

    // Resolve the currently authenticated hospital admin's Users record.
    private Users currentAdmin() {
        return usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Not authenticated"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getStaffLeaves() {
        Users admin = currentAdmin();
        return leaveDao.findByHospitalAdmin_IdOrderByCreatedTimeDesc(admin.getId())
                .stream()
                .map(this::toLeaveResponse)
                .toList();
    }

    @Override
    @Transactional
    public LeaveResponse updateStatus(Long leaveId, LeaveStatus status) {
        Users admin = currentAdmin();

        LeaveApplication leave = leaveDao.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Leave application not found: " + leaveId));

        if (leave.getHospitalAdmin() == null
                || leave.getHospitalAdmin().getId() != admin.getId()) {
            throw new AccessDeniedException("Not your worker's leave");
        }

        if (status != LeaveStatus.APPROVED && status != LeaveStatus.REJECTED) {
            throw new BusinessException("bad_status", "Status must be APPROVED or REJECTED");
        }

        leave.setStatus(status);
        LeaveApplication saved = leaveDao.save(leave);

        Users applicant = saved.getApplicantUser();
        if (applicant != null) {
            notificationService.saveNotification(
                    "Leave " + status,
                    "Your " + saved.getType() + " leave was " + status,
                    applicant.getId());
        }

        return toLeaveResponse(saved);
    }

    private LeaveResponse toLeaveResponse(LeaveApplication l) {
        return new LeaveResponse(
                l.getId(),
                l.getType() != null ? l.getType().name() : null,
                l.getFromDate() != null ? l.getFromDate().toString() : null,
                l.getToDate() != null ? l.getToDate().toString() : null,
                l.getDays(),
                l.getReason(),
                l.getStatus() != null ? l.getStatus().name() : null,
                l.getApplicantName(),
                l.getCreatedTime() != null ? l.getCreatedTime().toString() : null);
    }
}
