package com.deopuri.api.dto;

import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.PaymentStatus;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,

        int userId,
        String userName,

        Long productId,
        String productName,

        Integer variantId,
        String size,

        Integer quantity,
        String deliveryAddress,

        Double totalAmount,
        Double paidAmount,
        Double remainingAmount,
        PaymentStatus paymentStatus,

        OrderStatus status,
        LocalDateTime orderDate,
        LocalDateTime deliveredDate,

        String orderGroupId,
        String orderNumber,
        Double productAmount,
        Double productPrice
) {
} 
