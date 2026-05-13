package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record ProductRequest(
        @NotBlank(message = "Name is required") String name,
        String description,
        @NotNull(message = "Price is required") @PositiveOrZero(message = "Price must be >= 0") Double price,
        @NotNull(message = "Quantity is required") @PositiveOrZero(message = "Quantity must be >= 0") Integer quantity,
        LocalDate manufacturingDate,
        String imageUrl) {
}
