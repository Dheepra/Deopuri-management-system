package com.deopuri.service.service.impl;

import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.model.Users;

final class UserMapper {

    private UserMapper() {
    }

    static UserResponse toResponse(Users user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getMobileNo(),
                user.getAddress(),
                user.getShopName(),
                user.getRole(),
                user.getStatus());
    }
}
