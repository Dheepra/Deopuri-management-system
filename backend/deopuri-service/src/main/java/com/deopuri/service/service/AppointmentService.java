package com.deopuri.service.service;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;
import com.deopuri.api.model.AppointmentStatus;

import java.util.List;

public interface AppointmentService {
        AppointmentResponse createAppointment(
                        CreateAppointmentRequest request);

        AppointmentResponse getAppointmentById(
                        Long id);

        List<AppointmentResponse> getAppointmentsByDoctor(
                        Long doctorId);

        List<AppointmentResponse> getAppointmentsByAdmin(
                        Integer adminId);

        AppointmentResponse updateStatus(Long id, AppointmentStatus status);
        AppointmentResponse cancelAppointment(Long id);
}