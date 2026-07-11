package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.CreatePasswordRequest;
import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.UserDto;
import com.deopuri.api.rest.AuthController;
import com.deopuri.service.service.AuthService;
import com.deopuri.service.service.DoctorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class AuthControllerImpl implements AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private DoctorService doctorService;

    @Override
    public ResponseEntity<String> register(@RequestBody UserDto dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @Override
    public ResponseEntity<LoginResponse> login(
            LoginRequest dto) {

        return ResponseEntity.ok(
                authService.login(dto));
    }

    @Override
    public ResponseEntity<String> createPassword(
            @PathVariable Integer userId,
            @RequestBody CreatePasswordRequest request) {

        return doctorService.createPassword(userId, request);
    }
}