package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

import java.time.LocalDate;

public record ProductRequest(
        @NotBlank String name,
        String description,
        @NotNull Double price,
        @NotNull Integer quantity,
        LocalDate manufacturingDate,
        String imageUrl,
        List<ProductVariantRequest> variants   // ✅ ADD THIS
) {}