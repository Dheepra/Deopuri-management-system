package com.deopuri.api.dto;

public record CartDto(
        Integer userId,
        Long productId,
        Integer variantId,
        Integer quantity,
        String size
) {}