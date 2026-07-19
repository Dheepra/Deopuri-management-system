package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.CreateDoctorRequest;
import com.deopuri.api.dto.DoctorResponse;
import com.deopuri.api.model.Doctor;
import com.deopuri.service.service.DoctorService;
import com.deopuri.api.rest.DoctorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @Override
public ResponseEntity<List<DoctorResponse>> getAllDoctors() {

    List<Doctor> doctors = doctorService.getAllDoctors();

    List<DoctorResponse> response = doctors.stream()
        .map(doc -> new DoctorResponse(
                doc.getId(),
                doc.getUser().getFirstName(),
                doc.getUser().getLastName(),
                doc.getSpecialization(),
                doc.getQualification(),
                doc.getExperienceYears(),
                doc.getRegistrationNumber(),
                doc.getUser().getEmail(),
                doc.getUser().getMobileNo(),
                doc.getUser().getStatus() != null ? doc.getUser().getStatus().name() : null,
                doc.getConsultationFee()
        ))
        .toList();
    return ResponseEntity.ok(response);
}
@Override
public ResponseEntity<List<DoctorResponse>> getDoctorsByHospital(
        Integer hospitalAdminId) {

    return ResponseEntity.ok(
            doctorService.getDoctorsByHospital(hospitalAdminId)
    );
}
@Override
public ResponseEntity<DoctorResponse> getDoctorByUserId(
        @RequestParam Integer userId) {

    return ResponseEntity.ok(
            doctorService.getDoctorByUserId(userId)
    );
}

@Override
public ResponseEntity<DoctorResponse> updateConsultationFee(
        Long id,
        Double fee) {

    return ResponseEntity.ok(
            doctorService.updateConsultationFee(id, fee)
    );
}
}