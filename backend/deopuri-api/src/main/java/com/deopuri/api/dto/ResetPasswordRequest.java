package com.deopuri.api.dto;

// OTP-based reset: the user proves ownership of the email with the OTP that was mailed to them.
public record ResetPasswordRequest(String email, String otp, String password) {
}
