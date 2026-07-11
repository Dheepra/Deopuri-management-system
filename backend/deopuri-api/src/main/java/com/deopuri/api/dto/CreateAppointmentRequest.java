package com.deopuri.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateAppointmentRequest(

        String patientName,
        String patientMobile,
        String patientEmail,
        Integer patientAge,
        String patientGender,

        Long doctorId,

        LocalDate appointmentDate,
        LocalTime appointmentTime,

        String notes

) {
}