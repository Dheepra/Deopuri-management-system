package com.deopuri.service.dao;

import com.deopuri.api.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceDao extends JpaRepository<Attendance, Long> {

    boolean existsByStaff_IdAndDate(Long staffId, LocalDate date);

    List<Attendance> findByStaff_IdOrderByDateDesc(Long staffId);

    List<Attendance> findByStaff_HospitalAdmin_IdAndDate(int adminId, LocalDate date);

    List<Attendance> findByStaff_IdAndDateBetween(Long staffId, LocalDate from, LocalDate to);
}
