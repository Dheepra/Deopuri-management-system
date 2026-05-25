package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.UserDto;
import com.deopuri.api.rest.AuthController;
import com.deopuri.service.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class AuthControllerImpl implements AuthController {

    @Autowired
    private AuthService authService;

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
}