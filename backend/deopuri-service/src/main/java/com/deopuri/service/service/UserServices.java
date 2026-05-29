package com.deopuri.service.service;

import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.dto.UserUpdateRequest;
import com.deopuri.api.model.UserRole;

import java.util.List;

public interface UserServices {

    
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
