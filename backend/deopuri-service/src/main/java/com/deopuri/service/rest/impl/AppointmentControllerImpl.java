package com.deopuri.service.rest.impl;

import com.deopuri.api.rest.AppointmentController;
import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;
import com.deopuri.api.model.AppointmentStatus;
import com.deopuri.service.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class AppointmentControllerImpl
        implements AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentControllerImpl(
            AppointmentService appointmentService) {

        this.appointmentService = appointmentService;
    }

    @Override
    public ResponseEntity<AppointmentResponse> createAppointment(
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

    @Override
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByDoctor(
                        doctorId));
    }

    @Override
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByAdmin(
            @PathVariable Integer adminId) {

        return ResponseEntity.ok(
                appointmentService.getAppointmentsByAdmin(
                        adminId));
    }

    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {

        return ResponseEntity.ok(
                appointmentService.updateStatus(id, status));
    }

    @Override
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                appointmentService.cancelAppointment(id));
    }
}