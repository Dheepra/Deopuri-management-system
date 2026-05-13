package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProductVariantRequest(
        @NotBlank(message = "Size is required") String size,
        @NotNull(message = "Stock is required") @PositiveOrZero(message = "Stock must be >= 0") Integer stock) {
}
