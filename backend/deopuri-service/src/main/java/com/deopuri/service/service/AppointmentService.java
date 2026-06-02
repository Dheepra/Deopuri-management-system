package com.deopuri.service.service;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;


public interface AppointmentService {
    AppointmentResponse createAppointment(
            CreateAppointmentRequest request);

    AppointmentResponse getAppointmentById(
            Long id);
}