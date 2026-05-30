package com.deopuri.service.service;

import org.springframework.http.ResponseEntity;

import com.deopuri.api.dto.CreateDoctorRequest;
import com.deopuri.api.dto.CreatePasswordRequest;

public interface DoctorService {
    String createDoctor(
            CreateDoctorRequest request,
            int hospitalAdminId);
             ResponseEntity<String> createPassword(CreatePasswordRequest request);
}
