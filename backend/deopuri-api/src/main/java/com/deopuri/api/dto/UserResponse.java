package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.UserStatus;

public record UserResponse(
        int id,
        String firstName,
        String lastName,
        String email,
        String mobileNo,
        String address,
        String shopName,
        UserRole role,
        UserStatus status) {
}
