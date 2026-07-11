package com.deopuri.api.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateRawMaterialRequest(

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than 0")
        Double quantity,

        @NotBlank(message = "Unit is required")
        String unit,

        @NotNull(message = "Unit price is required")
        @Positive(message = "Unit price must be greater than 0")
        Double unitPrice,

        @NotBlank(message = "Supplier name is required")
        String supplierName,

        String description,

        @NotNull(message = "Purchase date is required")
        LocalDate purchaseDate

) {
}