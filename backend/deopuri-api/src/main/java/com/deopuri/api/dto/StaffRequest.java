package com.deopuri.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StaffRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Role is required") String role,
        @NotBlank(message = "Department is required") String department,
        @NotBlank(message = "Shift is required") String shift,
        String status,
        // Login identity — a Users account (role STAFF) is created and an invite is emailed so the
        // staff member can sign in to their portal. Required on create; ignored on update.
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
        @NotBlank(message = "Mobile is required") String mobileNo) {
}
