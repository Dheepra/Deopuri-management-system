package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;

public record LoginResponse(

        String token,

        long expiresIn,

        UserRole role,

        Integer id

) {

    public static LoginResponse bearer(
            String token,
            long expiresInSeconds,
            UserRole role,
            Integer id
    ) {

        return new LoginResponse(
                token,
                expiresInSeconds,
                role,
                id
        );
    }
}