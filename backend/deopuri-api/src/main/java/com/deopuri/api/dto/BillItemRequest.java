package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// One line on a bill. salePrice optional — falls back to the stock's retail price.
public record BillItemRequest(
        @NotBlank String productName,
        @NotNull @Positive Integer quantity,
        Double salePrice
) {
}
