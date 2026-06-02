package com.deopuri.service.rest.impl;

import com.deopuri.api.rest.AppointmentController;
import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;

import com.deopuri.service.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AppointmentControllerImpl
        implements AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentControllerImpl(
            AppointmentService appointmentService) {

        this.appointmentService = appointmentService;
    }

    @Override
    public ResponseEntity<AppointmentResponse>createAppointment(
            @RequestBody CreateAppointmentRequest request) {

        return ResponseEntity.ok(
                appointmentService.createAppointment(request));
    }

    @Override
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentById(id));
    }
}