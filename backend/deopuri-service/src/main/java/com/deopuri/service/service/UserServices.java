package com.deopuri.service.service;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.UserRegisterRequest;
import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.dto.UserUpdateRequest;
import com.deopuri.api.model.UserRole;

import java.util.List;

public interface UserServices {

    UserResponse register(UserRegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse approveUser(int userId);

    UserResponse rejectUser(int userId);

    List<UserResponse> getPendingUsers();

    List<UserResponse> getAllUsers();

    UserResponse getUserById(int id);

    List<UserResponse> searchByFirstName(String name);

    UserResponse updateOwnProfile(int id, UserUpdateRequest request);

    UserResponse updateRole(int id, UserRole role);

    void deleteUser(int id);
}
