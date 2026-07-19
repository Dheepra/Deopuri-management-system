package com.deopuri.api.dto;

import java.time.LocalDate;

public record MedicalStockResponse(
        Long id,
        String productName,
        int quantity,
        Double costPrice,
        Double retailPrice,
        Double marginPerUnit,   // retailPrice - costPrice
        Double marginPercent,   // margin as % of cost
        LocalDate expiryDate,
        String sourceOrderNumber
) {
}
