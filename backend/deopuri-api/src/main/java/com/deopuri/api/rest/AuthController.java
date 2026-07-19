package com.deopuri.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.deopuri.api.dto.CreatePasswordRequest;
import com.deopuri.api.dto.ForgotPasswordRequest;
import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.ResetPasswordRequest;
import com.deopuri.api.dto.UserDto;

@RequestMapping("/deopuri/auth")
public interface AuthController {

        @PostMapping("/register")
        ResponseEntity<String> register(@RequestBody UserDto dto);

        @PostMapping("/login")
        ResponseEntity<LoginResponse> login(
                        @RequestBody LoginRequest dto);

        // Sliding-session refresh: needs a still-valid token (JWT filter authenticates it),
        // returns a brand-new token so an active client never gets logged out.
        @PostMapping("/refresh")
        ResponseEntity<LoginResponse> refresh();

        @PostMapping("/create-password/{userId}")
        ResponseEntity<String> createPassword(Integer userId, CreatePasswordRequest request);

        @PostMapping("/forgot-password")
        ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request);

        @PostMapping("/reset-password")
        ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request);
}
