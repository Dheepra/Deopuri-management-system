package com.deopuri.api.rest;

import java.util.List;

import com.deopuri.api.dto.DoctorResponse;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.deopuri.api.dto.CreateDoctorRequest;

@RequestMapping("/api/hospital-admin")
public interface DoctorController {

        @PostMapping("/doctors")
        ResponseEntity<String> createDoctor(
                        @RequestBody CreateDoctorRequest request,
                        @RequestParam int hospitalAdminId);

        @GetMapping("/doctors")
        ResponseEntity<List<DoctorResponse>> getAllDoctors();

        @GetMapping("/doctors/hospital/{hospitalAdminId}")
ResponseEntity<List<DoctorResponse>> getDoctorsByHospital(
        @PathVariable Integer hospitalAdminId);

        @GetMapping("/doctors/me")
ResponseEntity<DoctorResponse> getDoctorByUserId(
        @RequestParam Integer userId);
}
