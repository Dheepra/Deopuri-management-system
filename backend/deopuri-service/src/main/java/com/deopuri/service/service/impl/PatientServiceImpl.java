package com.deopuri.service.service.impl;

import com.deopuri.api.dto.PatientResponse;
import com.deopuri.api.model.Appointment;
import com.deopuri.api.model.Users;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.AppointmentDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.PatientService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Patients are not stored in their own table — they are the people who have booked appointments
 * with this hospital admin. This service reads the admin's appointments and collapses them into one
 * row per unique patient (keyed by mobile), summarising age/gender, the most-recent doctor/visit,
 * the latest status, and the total number of visits.
 */
@Service
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    private final AppointmentDao appointmentDao;
    private final UsersDao usersDao;

    public PatientServiceImpl(AppointmentDao appointmentDao, UsersDao usersDao) {
        this.appointmentDao = appointmentDao;
        this.usersDao = usersDao;
    }

    private Users currentUser() {
        return usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Not authorized"));
    }

    @Override
    public List<PatientResponse> getMyPatients() {
        Users me = currentUser();

        List<Appointment> appointments = appointmentDao.findByHospitalAdminId(me.getId());

        // Group by mobile (fall back to a lowercased name when mobile is missing) so repeat
        // patients show up once. LinkedHashMap keeps a stable order.
        Map<String, List<Appointment>> byPatient = new LinkedHashMap<>();
        for (Appointment a : appointments) {
            String key = (a.getPatientMobile() != null && !a.getPatientMobile().isBlank())
                    ? a.getPatientMobile().trim()
                    : "name:" + (a.getPatientName() == null ? "" : a.getPatientName().trim().toLowerCase());
            byPatient.computeIfAbsent(key, k -> new ArrayList<>()).add(a);
        }

        List<PatientResponse> patients = new ArrayList<>(byPatient.size());
        for (List<Appointment> visits : byPatient.values()) {
            // Representative details come from the most recent appointment (by date, then time).
            Appointment latest = visits.stream()
                    .max(Comparator
                            .comparing(Appointment::getAppointmentDate)
                            .thenComparing(Appointment::getAppointmentTime))
                    .orElse(visits.get(0));

            String doctorName = "—";
            try {
                if (latest.getDoctor() != null && latest.getDoctor().getUser() != null) {
                    doctorName = latest.getDoctor().getUser().getFirstName();
                }
            } catch (Exception ignored) {
                // Lazy doctor/user not reachable — leave the placeholder.
            }

            patients.add(new PatientResponse(
                    latest.getPatientName(),
                    latest.getPatientMobile(),
                    latest.getPatientAge(),
                    latest.getPatientGender(),
                    doctorName,
                    latest.getAppointmentDate() == null ? null : latest.getAppointmentDate().toString(),
                    latest.getStatus() == null ? null : latest.getStatus().name(),
                    visits.size()));
        }

        return patients;
    }
}
