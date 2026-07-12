package com.deopuri.service.service;

import com.deopuri.api.dto.UserDto;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;

public interface AuthService {

    String register(UserDto dto);

    LoginResponse login(LoginRequest dto);

    // Forgot-password: emails a 6-digit OTP. Throws if the email is not registered.
    void forgotPassword(String email);

    // Reset-password: verifies the emailed OTP for the email, then sets the new password.
    void resetPassword(String email, String otp, String newPassword);
}