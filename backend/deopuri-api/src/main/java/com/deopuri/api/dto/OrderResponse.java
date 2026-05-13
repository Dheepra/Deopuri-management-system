package com.deopuri.api.dto;

import com.deopuri.api.model.OrderStatus;

import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        int userId,
        Long productId,
        Integer variantId,
        Integer quantity,
        Double totalAmount,
        OrderStatus status,
        LocalDateTime orderDate) {
}
