package com.deopuri.service.service.impl;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;
import com.deopuri.api.model.AppointmentStatus;
import com.deopuri.api.model.Appointment;
import com.deopuri.api.model.Doctor;
import com.deopuri.service.dao.AppointmentDao;
import com.deopuri.service.dao.DoctorDao;
import com.deopuri.service.dao.NotificationDao;
import com.deopuri.api.model.Notification;
import com.deopuri.service.service.AppointmentService;
import com.deopuri.service.service.EmailService;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceImpl.class);

        private final AppointmentDao appointmentDao;
        private final DoctorDao doctorDao;

        private final NotificationDao notificationDao;

        @Autowired
        private EmailService emailService;

        public AppointmentServiceImpl(
                        AppointmentDao appointmentDao,
                        DoctorDao doctorDao,
                        EmailService emailService,
                        NotificationDao notificationDao) {

                this.appointmentDao = appointmentDao;
                this.doctorDao = doctorDao;
                this.emailService = emailService;
                this.notificationDao = notificationDao;
        }

        @Override
        public AppointmentResponse createAppointment(
                        CreateAppointmentRequest request) {

                Doctor doctor = doctorDao.findById(
                                request.doctorId())
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

                if (request.appointmentDate()
                                .isBefore(LocalDate.now())) {

                        throw new BusinessException("appointment_date_in_past",
                                        "Appointment date cannot be in past");
                }

                boolean slotExists = appointmentDao
                                .existsByDoctorAndAppointmentDateAndAppointmentTime(
                                                doctor,
                                                request.appointmentDate(),
                                                request.appointmentTime());

                if (slotExists) {

                        throw new BusinessException("slot_already_booked",
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
                Notification notification = new Notification();

                notification.setTitle("New Appointment Request");

                notification.setMessage(
                                saved.getPatientName()
                                                + " booked an appointment with Dr. "
                                                + saved.getDoctor().getUser().getFirstName()
                                                + " "
                                                + saved.getDoctor().getUser().getLastName());

                notification.setUserId(
                                saved.getHospitalAdmin().getId());

                notification.setIsRead(false);
                notification.setIsActive(true);

                notificationDao.save(notification);

                String subject = "Appointment Request Received";

                String body = """
                                <html>
                                <body style="font-family: Arial, sans-serif;">

                                    <div style="text-align:center;">

                                        <img src="cid:logoImage"
                                             alt="Company Logo"
                                             style="width:120px;height:auto;margin-bottom:10px;">

                                        <h2 style="color:#2e7d32;">
                                            Deopuri Herbal Drugs and Pharmaceuticals
                                        </h2>
                                          <hr style="width:60%%; margin:15px auto;"/>

                                        <h3 style="margin-top:20px;">
                                            Appointment Request Received
                                        </h3>

                                        <p>Dear <b>%s</b>,</p>

                                        <p>Your appointment request has been received successfully.</p>

                                        <p>Please wait for hospital admin confirmation.</p>

                                        <br>

                                        <p><b>Hospital:</b> %s</p>
                                        <p><b>Doctor:</b> Dr. %s %s</p>
                                        <p><b>Date:</b> %s</p>
                                        <p><b>Time:</b> %s</p>

                                        <br>

                                        <p>
                                            Regards,<br>
                                            <b>Deopuri Herbal Drugs and Pharmaceuticals</b>
                                        </p>

                                    </div>

                                </body>
                                </html>
                                """.formatted(
                                saved.getPatientName(),
                                saved.getHospitalAdmin().getShopName(),
                                saved.getDoctor().getUser().getFirstName(),
                                saved.getDoctor().getUser().getLastName(),
                                saved.getAppointmentDate(),
                                saved.getAppointmentTime());

                emailService.sendEmail(
                                saved.getPatientEmail(),
                                subject,
                                body);

                return AppointmentResponse.from(saved);
        }

        @Override
        public AppointmentResponse getAppointmentById(Long id) {

                Appointment appointment = appointmentDao.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
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
                                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

                appointment.setStatus(status);

                Appointment saved = appointmentDao.save(appointment);

                if (status == AppointmentStatus.CONFIRMED) {
                  // Confirmation email is best-effort — a mail failure (missing/invalid
                  // patient email, SMTP down) must NOT roll back the status change.
                  try {
                        String subject = "Appointment Confirmed";

                        String body = """
                                        <html>
                                        <body style="font-family: Arial, sans-serif;">

                                            <div style="text-align:center;">

                                                <img src="cid:logoImage"
                                             alt="Company Logo"
                                             style="width:120px;height:auto;margin-bottom:10px;">

                                        <h2 style="color:#2e7d32;">
                                            Deopuri Herbal Drugs and Pharmaceuticals
                                        </h2>
                                          <hr style="width:60%%; margin:15px auto;"/>

                                                <h3>Appointment Confirmed</h3>

                                                <p>Dear <b>%s</b>,</p>

                                                <p>
                                                    Your appointment has been confirmed successfully.
                                                </p>

                                                <p><b>Hospital:</b> %s</p>
                                                <p><b>Doctor:</b> Dr. %s %s</p>
                                                <p><b>Date:</b> %s</p>
                                                <p><b>Time:</b> %s</p>

                                                <br>

                                                <p>
                                                    Thank you for choosing us.
                                                </p>

                                                <p>
                                                    Regards,<br>
                                                    <b>Deopuri Herbal Drugs and Pharmaceuticals</b>
                                                </p>

                                            </div>

                                        </body>
                                        </html>
                                        """.formatted(
                                        saved.getPatientName(),
                                        saved.getHospitalAdmin().getShopName(),
                                        saved.getDoctor().getUser().getFirstName(),
                                        saved.getDoctor().getUser().getLastName(),
                                        saved.getAppointmentDate(),
                                        saved.getAppointmentTime());

                        emailService.sendEmail(
                                        saved.getPatientEmail(),
                                        subject,
                                        body);
                  } catch (Exception mailEx) {
                        log.warn("Confirmation email failed for appointment {}: {}",
                                        saved.getId(), mailEx.getMessage());
                  }
                }

                return AppointmentResponse.from(saved);
        }

        @Transactional
        @Override
        public AppointmentResponse cancelAppointment(Long id) {

                Appointment appointment = appointmentDao.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

                appointment.setStatus(AppointmentStatus.CANCELLED);

                Appointment saved = appointmentDao.save(appointment);

                return AppointmentResponse.from(saved);
        }
}