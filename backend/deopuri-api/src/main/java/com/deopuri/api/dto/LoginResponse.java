package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;
public record LoginResponse(

        String token,
        long expiresIn,
        UserRole role,
        Integer id,
        String status,
        // Returned only on FIRST_TIME_LOGIN so the client can forward it to create-password
        // (proves the user knew the emailed temp password). Null on normal login.
        String invitationToken

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
                id,
                "SUCCESS",
                null
        );
    }

    public static LoginResponse firstTimeLogin(
            Integer id,
            String invitationToken
    ) {
        return new LoginResponse(
                null,
                0,
                UserRole.DOCTOR,
                id,
                "FIRST_TIME_LOGIN",
                invitationToken
        );
    }
}