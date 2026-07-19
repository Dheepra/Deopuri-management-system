package com.deopuri.api.dto;

public record CreateDoctorRequest(String firstName,

        String lastName,

        String email,

        String mobileNo,
        String address,

        String qualification,

        String specialization,

        Integer experienceYears,

        Double consultationFee) {

}
