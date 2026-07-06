package com.deopuri.api.dto;

public record PaymentRequest(
        Double amount,
        String paymentMethod,
        String remark
) {}