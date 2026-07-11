package com.deopuri.api.dto;

public record CreatePasswordRequest(

        Integer userId,
        String password,
        // Single-use invitation token: proves the caller received the emailed setup link (or logged in
        // with the temp password, which returns the token). Without it anyone could set a password for
        // any not-yet-activated user by guessing the userId.
        String token

) {
}