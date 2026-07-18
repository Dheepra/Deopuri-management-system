package com.deopuri.service.service;

import com.deopuri.api.dto.UserDto;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;

public interface AuthService {

    String register(UserDto dto);

    LoginResponse login(LoginRequest dto);

    // Issues a fresh token for the currently-authenticated user (sliding session).
    // Only reachable while the existing token is still valid — the JWT filter rejects
    // an expired token before it gets here, so an idle session simply lapses.
    LoginResponse refresh();

    // Forgot-password: emails a 6-digit OTP. Throws if the email is not registered.
    void forgotPassword(String email);

    // Reset-password: verifies the emailed OTP for the email, then sets the new password.
    void resetPassword(String email, String otp, String newPassword);
}