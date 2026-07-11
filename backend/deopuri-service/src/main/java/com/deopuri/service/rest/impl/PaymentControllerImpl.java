package com.deopuri.service.rest.impl;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.deopuri.api.dto.PaymentRequest;
import com.deopuri.api.rest.PaymentController;
import com.deopuri.service.service.PaymentService;


@RestController
public class PaymentControllerImpl implements PaymentController {

    private final PaymentService paymentService;

    public PaymentControllerImpl(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public ResponseEntity<?> addPayment(String orderNumber, PaymentRequest request) {
    return ResponseEntity.ok(paymentService.addPayment(orderNumber, request));
}

public ResponseEntity<?> getPaymentHistory(String orderNumber) {
    return ResponseEntity.ok(paymentService.getPaymentHistory(orderNumber));
}
}    

