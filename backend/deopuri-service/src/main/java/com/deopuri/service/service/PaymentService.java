package com.deopuri.service.service;

import com.deopuri.api.dto.PaymentRequest;
import com.deopuri.api.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse addPayment(
            Long orderId,
            PaymentRequest request
    );

    List<PaymentResponse> getPaymentHistory(
            Long orderId
    );

}