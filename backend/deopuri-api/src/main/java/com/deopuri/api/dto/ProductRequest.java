package com.deopuri.api.dto;

import jakarta.validation.Valid;
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
        // @Valid cascades bean validation into each variant. Without it the @NotBlank/@NotNull rules
        // on ProductVariantRequest (size, stock, price) never run, so a blank size or missing price
        // slips through to the DB and surfaces as a cryptic 409 "Data constraint violation" instead of
        // a clear 400 field error like "Price is required".
        List<@Valid ProductVariantRequest> variants
) {}
