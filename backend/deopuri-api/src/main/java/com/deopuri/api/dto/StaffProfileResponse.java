package com.deopuri.api.dto;

public record StaffProfileResponse(
        Long id,
        String name,
        String role,
        String department,
        String shift,
        String status,
        String email,
        String mobileNo) {
}
