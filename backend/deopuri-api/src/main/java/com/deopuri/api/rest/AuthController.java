package com.deopuri.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.UserDto;

@RequestMapping("/api/auth")
public interface AuthController {

    @PostMapping("/register")
    ResponseEntity<String> register(@RequestBody UserDto dto);

    @PostMapping("/login")
    ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest dto);
}
