package com.deopuri.api.dto;

public record BillItemResponse(
        String productName,
        int quantity,
        Double salePrice,
        Double costPrice,
        Double lineTotal,   // salePrice * quantity
        Double lineProfit   // (salePrice - costPrice) * quantity
) {
}
