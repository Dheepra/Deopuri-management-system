package com.deopuri.api.dto;

public record ProductVariantResponse(
        int id,
        String size,
        Integer stock,
        Long productId) {
}
