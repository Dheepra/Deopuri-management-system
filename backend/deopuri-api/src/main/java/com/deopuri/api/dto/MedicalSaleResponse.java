package com.deopuri.api.dto;

import java.time.LocalDate;

public record MedicalSaleResponse(
        Long id,
        String productName,
        int quantity,
        Double salePrice,
        Double costPrice,
        Double totalAmount,
        Double profit,        // (salePrice - costPrice) * quantity
        LocalDate saleDate
) {
}
