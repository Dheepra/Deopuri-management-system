package com.deopuri.api.rest;

import java.util.List;

import com.deopuri.api.dto.PatientResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/deopuri/hospital-admin")
public interface PatientController {

    /** Patients derived from this admin's appointments (read-only). */
    @GetMapping("/patients")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    ResponseEntity<List<PatientResponse>> getMyPatients();
}
