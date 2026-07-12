package com.deopuri.service.dao;

import com.deopuri.api.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffDao extends JpaRepository<Staff, Long> {

    List<Staff> findByHospitalAdmin_Id(int hospitalAdminId);

    // Resolve the Staff record from the logged-in staff user's id (staff portal).
    Optional<Staff> findByUser_Id(int userId);

    boolean existsByUser_Email(String email);
}
