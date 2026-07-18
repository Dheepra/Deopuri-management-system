package com.deopuri.api.dto;

import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

// Edit an existing stock line — set retail price, adjust quantity, or set expiry. All optional.
public record UpdateStockRequest(
        @PositiveOrZero Integer quantity,
        @PositiveOrZero Double retailPrice,
        LocalDate expiryDate
) {
}
