package com.deopuri.api.dto;

import java.time.LocalDate;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        Double price,
        Integer quantity,
        LocalDate manufacturingDate,
        String imageUrl,
        List<ProductVariantResponse> variants) {
}
