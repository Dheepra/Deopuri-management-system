package com.deopuri.api.dto;

public record UserDto(
        String firstName,
        String lastName,
        String email,
        String password,
        String mobileNo,
        String address,
        String shopName,
        String role
) {}