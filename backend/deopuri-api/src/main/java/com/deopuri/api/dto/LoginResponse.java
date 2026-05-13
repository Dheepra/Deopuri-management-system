package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserRole role) {

    public static LoginResponse bearer(String token, long expiresInSeconds, UserRole role) {
        return new LoginResponse(token, "Bearer", expiresInSeconds, role);
    }
}
