package com.deopuri.service.service.impl;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;
import com.deopuri.api.model.AppointmentStatus;
import com.deopuri.api.model.Appointment;
import com.deopuri.api.model.Doctor;
import com.deopuri.service.dao.AppointmentDao;
import com.deopuri.service.dao.DoctorDao;
import com.deopuri.service.service.AppointmentService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentServiceImpl implements AppointmentService {

        private final AppointmentDao appointmentDao;
        private final DoctorDao doctorDao;

        public AppointmentServiceImpl(
                        AppointmentDao appointmentDao,
                        DoctorDao doctorDao) {

                this.appointmentDao = appointmentDao;
                this.doctorDao = doctorDao;
        }

        @Override
        public AppointmentResponse createAppointment(
                        CreateAppointmentRequest request) {

                Doctor doctor = doctorDao.findById(
                                request.doctorId())
                                .orElseThrow(() -> new RuntimeException("Doctor not found"));

                if (request.appointmentDate()
                                .isBefore(LocalDate.now())) {

                        throw new RuntimeException(
                                        "Appointment date cannot be in past");
                }

                boolean slotExists = appointmentDao
                                .existsByDoctorAndAppointmentDateAndAppointmentTime(
                                                doctor,
                                                request.appointmentDate(),
                                                request.appointmentTime());

                if (slotExists) {

                        throw new RuntimeException(
                                        "This slot is already booked");
                }

                Appointment appointment = new Appointment();

                appointment.setAppointmentNumber(
                                "APT-" + System.currentTimeMillis());

                appointment.setPatientName(
                                request.patientName());

                appointment.setPatientMobile(
                                request.patientMobile());

                appointment.setPatientEmail(
                                request.patientEmail());

                appointment.setPatientAge(
                                request.patientAge());

                appointment.setPatientGender(
                                request.patientGender());

                appointment.setAppointmentDate(
                                request.appointmentDate());

                appointment.setAppointmentTime(
                                request.appointmentTime());

                appointment.setNotes(
                                request.notes());

                appointment.setDoctor(doctor);

                appointment.setHospitalAdmin(
                                doctor.getHospitalAdmin());

                appointment.setStatus(
                                AppointmentStatus.BOOKED);

                Appointment saved = appointmentDao.save(appointment);

                return AppointmentResponse.from(saved);
        }

        @Override
        public AppointmentResponse getAppointmentById(Long id) {

                Appointment appointment = appointmentDao.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Appointment not found"));

                return AppointmentResponse.from(appointment);
        }

        @Transactional(readOnly = true)
        @Override
        public List<AppointmentResponse> getAppointmentsByDoctor(
                        Long doctorId) {

                return appointmentDao.findByDoctorId(doctorId)
                                .stream()
                                .map(AppointmentResponse::from)
                                .toList();
        }

        @Transactional(readOnly = true)
        @Override
        public List<AppointmentResponse> getAppointmentsByAdmin(
                        Integer adminId) {

                return appointmentDao.findByHospitalAdminId(adminId)
                                .stream()
                                .map(AppointmentResponse::from)
                                .toList();
        }

        @Transactional
        @Override
        public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {

                Appointment appointment = appointmentDao.findById(id)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));

                appointment.setStatus(status);

                Appointment saved = appointmentDao.save(appointment);

                return AppointmentResponse.from(saved);
        }

        @Transactional
        @Override
        public AppointmentResponse cancelAppointment(Long id) {

                Appointment appointment = appointmentDao.findById(id)
                                .orElseThrow(() -> new RuntimeException("Appointment not found"));

                appointment.setStatus(AppointmentStatus.CANCELLED);

                Appointment saved = appointmentDao.save(appointment);

                return AppointmentResponse.from(saved);
        }
}