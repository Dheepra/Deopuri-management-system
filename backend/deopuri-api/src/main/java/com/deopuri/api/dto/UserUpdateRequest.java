package com.deopuri.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        String firstName,
        String lastName,
        @Email(message = "Invalid email format") String email,
        @Size(min = 8, message = "Password must be at least 8 characters") String password,
        @Size(min = 10, max = 10, message = "Mobile number must be 10 digits") String mobileNo,
        String address,
        String shopName) {
}
