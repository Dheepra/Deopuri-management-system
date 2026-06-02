package com.deopuri.service.service;

import org.springframework.http.ResponseEntity;

import com.deopuri.api.dto.CreateDoctorRequest;
import com.deopuri.api.dto.CreatePasswordRequest;
import com.deopuri.api.model.Doctor;
import java.util.List;

public interface DoctorService {
    String createDoctor(
            CreateDoctorRequest request,
            int hospitalAdminId);
             ResponseEntity<String> createPassword(Integer userId, CreatePasswordRequest request);

              List<Doctor> getAllDoctors(); 

}
