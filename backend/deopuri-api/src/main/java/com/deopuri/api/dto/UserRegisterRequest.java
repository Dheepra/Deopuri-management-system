package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
        @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
        @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password,
        @NotBlank(message = "Mobile number is required") @Size(min = 10, max = 10, message = "Mobile number must be 10 digits") String mobileNo,
        @NotBlank(message = "Address is required") String address,
        @NotBlank(message = "Shop name is required") String shopName,
        UserRole role) {
}
