package com.deopuri.api.dto;

import com.deopuri.api.model.OrderStatus;
public record CartResponse(
    Long orderId,
    int userId,
    Long productId,
    String productName,
    Integer variantId,
    String size,
    Integer quantity,
    Double totalAmount,
    OrderStatus status
) {
} 