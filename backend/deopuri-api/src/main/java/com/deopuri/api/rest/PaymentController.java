package com.deopuri.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.deopuri.api.dto.PaymentRequest;

@RequestMapping("/api/payments")
public interface PaymentController {

    @PostMapping("/{orderId}")
    ResponseEntity<?> addPayment(
            @PathVariable Long orderId,
            @RequestBody PaymentRequest request
    );

    @GetMapping("/order/{orderId}")
    ResponseEntity<?> getPaymentHistory(
            @PathVariable Long orderId
    );

}
