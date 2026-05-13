package com.deopuri.api.rest;

import com.deopuri.api.dto.LoginRequest;
import com.deopuri.api.dto.LoginResponse;
import com.deopuri.api.dto.RoleUpdateRequest;
import com.deopuri.api.dto.UserRegisterRequest;
import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RequestMapping("/api")
public interface UserController {

    @PostMapping("/auth/register")
    ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegisterRequest request);

    @PostMapping("/auth/login")
    ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest request);

    @GetMapping("/users/me")
    ResponseEntity<UserResponse> getCurrentUser();

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<List<UserResponse>> getAllUsers();

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == @userControllerImpl.currentUserId()")
    ResponseEntity<UserResponse> getUserById(@PathVariable int id);

    @GetMapping("/users/search/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<List<UserResponse>> getUsersByName(@PathVariable String name);

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == @userControllerImpl.currentUserId()")
    ResponseEntity<UserResponse> updateUser(@PathVariable int id,
                                            @Valid @RequestBody UserUpdateRequest request);

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> deleteUser(@PathVariable int id);

    @PutMapping("/admin/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<UserResponse> approveUser(@PathVariable int id);

    @PutMapping("/admin/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<UserResponse> rejectUser(@PathVariable int id);

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<UserResponse> updateRole(@PathVariable int id,
                                            @Valid @RequestBody RoleUpdateRequest request);

    @GetMapping("/admin/users/pending")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<List<UserResponse>> getPendingUsers();
}
