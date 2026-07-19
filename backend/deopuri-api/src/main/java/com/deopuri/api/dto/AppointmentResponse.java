package com.deopuri.api.dto;

import com.deopuri.api.model.Appointment;

public record AppointmentResponse(
        Long id,
        String appointmentNumber,

        String patientName,
        String patientMobile,
        Integer patientAge,
        String patientGender,

        String doctorName,
        String specialization,
        String appointmentDate,
        String appointmentTime,
        String notes,

        String status,

        Double amount,
        String paymentMethod,
        String paymentStatus,
        String paymentRef) {

    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getAppointmentNumber(),
                appointment.getPatientName(),
                appointment.getPatientMobile(),
                appointment.getPatientAge(),
                appointment.getPatientGender(),
                appointment.getDoctor().getUser().getFirstName(),
                appointment.getDoctor().getSpecialization(),
                appointment.getAppointmentDate().toString(),
                appointment.getAppointmentTime().toString(),
                appointment.getNotes(),
                appointment.getStatus().name(),
                appointment.getAmount(),
                appointment.getPaymentMethod(),
                appointment.getPaymentStatus() != null ? appointment.getPaymentStatus().name() : null,
                appointment.getPaymentRef());
    }
}
