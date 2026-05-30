package com.deopuri.api.rest;

import org.springframework.http.ResponseEntity;
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

    
}
