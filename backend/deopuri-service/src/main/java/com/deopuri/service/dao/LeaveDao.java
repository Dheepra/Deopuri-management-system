package com.deopuri.service.dao;

import com.deopuri.api.model.LeaveApplication;
import com.deopuri.api.model.LeaveStatus;
import com.deopuri.api.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface LeaveDao extends JpaRepository<LeaveApplication, Long> {

    // The applicant's own leaves (staff or doctor), newest first.
    List<LeaveApplication> findByApplicantUser_IdOrderByCreatedTimeDesc(int applicantUserId);

    // All leaves the given hospital admin can approve.
    List<LeaveApplication> findByHospitalAdmin_IdOrderByCreatedTimeDesc(int adminId);

    // For balance computation.
    List<LeaveApplication> findByApplicantUser_IdAndTypeAndStatusIn(
            int applicantUserId, LeaveType type, Collection<LeaveStatus> statuses);

    // Approved leaves for a worker — used to mark them "on leave" in the attendance roster.
    List<LeaveApplication> findByApplicantUser_IdAndStatus(int applicantUserId, LeaveStatus status);
}
