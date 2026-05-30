package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.CreateDoctorRequest;

import com.deopuri.service.service.DoctorService;
import com.deopuri.api.rest.DoctorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DoctorControllerImpl implements DoctorController {

    private final DoctorService doctorService;

    public DoctorControllerImpl(
            DoctorService doctorService) {

        this.doctorService = doctorService;
    }

    @Override
    public ResponseEntity<String> createDoctor(
            @RequestBody CreateDoctorRequest request,
            @RequestParam int hospitalAdminId) {

        return ResponseEntity.ok(
                doctorService.createDoctor(request, hospitalAdminId));
    }
}