package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

// A sale recorded by a medical admin. If salePrice is omitted, the stock's retail price is used.
public record RecordSaleRequest(
        @NotBlank String productName,
        @NotNull @Positive Integer quantity,
        Double salePrice,
        LocalDate saleDate
) {
}
