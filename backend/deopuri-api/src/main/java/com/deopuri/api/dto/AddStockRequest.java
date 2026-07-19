package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

// Manual stock entry by a medical admin. costPrice/retailPrice are per-unit.
public record AddStockRequest(
        @NotBlank String productName,
        @NotNull @PositiveOrZero Integer quantity,
        @PositiveOrZero Double costPrice,
        @PositiveOrZero Double retailPrice,
        LocalDate expiryDate
) {
}
