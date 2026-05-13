package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.RoleUpdateRequest;
import com.deopuri.api.dto.UserRegisterRequest;
import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.dto.UserUpdateRequest;
import com.deopuri.api.rest.UserController;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.UserServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserControllerImpl implements UserController {

    private final UserServices service;
    private final UsersDao usersDao;

    public UserControllerImpl(UserServices service, UsersDao usersDao) {
        this.service = service;
        this.usersDao = usersDao;
    }

    @Override
    public ResponseEntity<UserResponse> registerUser(UserRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
    }

    @Override
    public ResponseEntity<LoginResponse> loginUser(LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @Override
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(service.getUserById(currentUserId()));
    }

    @Override
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @Override
    public ResponseEntity<UserResponse> getUserById(int id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @Override
    public ResponseEntity<List<UserResponse>> getUsersByName(String name) {
        return ResponseEntity.ok(service.searchByFirstName(name));
    }

    @Override
    public ResponseEntity<UserResponse> updateUser(int id, UserUpdateRequest request) {
        return ResponseEntity.ok(service.updateOwnProfile(id, request));
    }

    @Override
    public ResponseEntity<Void> deleteUser(int id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<UserResponse> approveUser(int id) {
        return ResponseEntity.ok(service.approveUser(id));
    }

    @Override
    public ResponseEntity<UserResponse> rejectUser(int id) {
        return ResponseEntity.ok(service.rejectUser(id));
    }

    @Override
    public ResponseEntity<UserResponse> updateRole(int id, RoleUpdateRequest request) {
        return ResponseEntity.ok(service.updateRole(id, request.role()));
    }

    @Override
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        return ResponseEntity.ok(service.getPendingUsers());
    }

    public int currentUserId() {
        return usersDao.findByEmail(SecurityUtils.currentUserEmail())
                .map(u -> u.getId())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
    }
}
