package com.deopuri.service.dao;

import com.deopuri.api.model.Appointment;
import com.deopuri.api.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentDao
        extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorAndAppointmentDateAndAppointmentTime(
            Doctor doctor,
            LocalDate appointmentDate,
            LocalTime appointmentTime);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByHospitalAdminId(Integer adminId);
}