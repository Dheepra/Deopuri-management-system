package com.deopuri.service.dao;

import com.deopuri.api.model.Doctor;
import com.deopuri.api.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorDao extends JpaRepository<Doctor, Long> {

    List<Doctor> findByHospitalAdmin(Users hospitalAdmin);

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByQualification(String qualification);

    List<Doctor> findByHospitalAdminId(Integer hospitalAdminId);

    boolean existsByUser_Email(String email);

   Optional<Doctor> findByUserId(Integer userId);
}