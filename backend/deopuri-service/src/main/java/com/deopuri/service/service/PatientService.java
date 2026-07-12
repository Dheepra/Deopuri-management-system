package com.deopuri.service.service;

import com.deopuri.api.dto.PatientResponse;

import java.util.List;

public interface PatientService {

    /** Unique patients derived from the current hospital admin's appointments. */
    List<PatientResponse> getMyPatients();
}
