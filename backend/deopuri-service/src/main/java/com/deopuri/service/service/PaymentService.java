package com.deopuri.service.service;

import com.deopuri.api.dto.PaymentRequest;
import com.deopuri.api.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse addPayment(String orderNumber, PaymentRequest request);

List<PaymentResponse> getPaymentHistory(String orderNumber);
}