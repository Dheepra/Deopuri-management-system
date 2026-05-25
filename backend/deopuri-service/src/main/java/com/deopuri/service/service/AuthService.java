package com.deopuri.service.service;

import com.deopuri.api.dto.UserDto;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;

public interface AuthService {

    String register(UserDto dto);

    LoginResponse login(LoginRequest dto);
}