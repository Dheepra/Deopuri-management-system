package com.deopuri.api.dto;

// Full doctor detail for the hospital admin's grid. email/mobile are populated only on
// authenticated admin listings; the public booking endpoint leaves them null.
public record DoctorResponse(Long id,
        String firstName,
        String lastName,
        String specialization,
        String qualification,
        Integer experienceYears,
        String registrationNumber,
        String email,
        String mobileNo,
        String status,
        Double consultationFee) {

}
