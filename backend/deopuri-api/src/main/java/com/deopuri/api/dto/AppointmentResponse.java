package com.deopuri.api.dto;

import com.deopuri.api.model.Appointment;
public record AppointmentResponse(
    Long id,
        String appointmentNumber,

        String patientName,
        String doctorName,
         String specialization,
        String appointmentDate,
        String appointmentTime,

        String status       

) {

    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
        appointment.getAppointmentNumber(),
        appointment.getPatientName(),
        appointment.getDoctor().getUser().getFirstName(),
         appointment.getDoctor().getSpecialization(),
        appointment.getAppointmentDate().toString(),
        appointment.getAppointmentTime().toString(),
        appointment.getStatus().name()
    );}
}