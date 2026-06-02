package com.deopuri.api.rest;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/appointments")
public interface AppointmentController {

    @PostMapping
    ResponseEntity<AppointmentResponse> createAppointment(
            CreateAppointmentRequest request);

    @GetMapping("/{id}")
    ResponseEntity<AppointmentResponse> getAppointmentById(
            Long id);
}