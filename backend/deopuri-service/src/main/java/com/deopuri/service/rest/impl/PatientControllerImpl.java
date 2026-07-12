package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.PatientResponse;
import com.deopuri.api.rest.PatientController;
import com.deopuri.service.service.PatientService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PatientControllerImpl implements PatientController {

    private final PatientService patientService;

    public PatientControllerImpl(PatientService patientService) {
        this.patientService = patientService;
    }

    @Override
    public ResponseEntity<List<PatientResponse>> getMyPatients() {
        return ResponseEntity.ok(patientService.getMyPatients());
    }
}
