package com.deopuri.api.dto;

public record CartItemRequest(
        Long productId,
        Integer variantId,
        Integer quantity,
        String size
) {
}