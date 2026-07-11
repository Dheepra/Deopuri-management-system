package com.deopuri.api.rest;

import com.deopuri.api.dto.AppointmentResponse;
import com.deopuri.api.dto.CreateAppointmentRequest;
import com.deopuri.api.model.AppointmentStatus;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RequestMapping("/api/appointments")
public interface AppointmentController {

        @PostMapping
        ResponseEntity<AppointmentResponse> createAppointment(
                        CreateAppointmentRequest request);

        @GetMapping("/{id}")
        ResponseEntity<AppointmentResponse> getAppointmentById(
                        Long id);

        @GetMapping("/doctor/{doctorId}")
        ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(
                        @PathVariable Long doctorId);

        @GetMapping("/admin/{adminId}")
        ResponseEntity<List<AppointmentResponse>> getAppointmentsByAdmin(
                        @PathVariable Integer adminId);

        @PatchMapping("/{id}/status")
        ResponseEntity<AppointmentResponse> updateStatus(
                        @PathVariable Long id,
                        @RequestParam AppointmentStatus status);

        @PatchMapping("/{id}/cancel")
        ResponseEntity<AppointmentResponse> cancelAppointment(
                        @PathVariable Long id);
}