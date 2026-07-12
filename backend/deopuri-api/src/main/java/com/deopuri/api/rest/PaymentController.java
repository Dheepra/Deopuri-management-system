package com.deopuri.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.deopuri.api.dto.PaymentRequest;

@RequestMapping("/deopuri/payments")
public interface PaymentController {

        @PostMapping("/{orderNumber}")
        ResponseEntity<?> addPayment(
                        @PathVariable String orderNumber,
                        @RequestBody PaymentRequest request);

        @GetMapping("/order/{orderNumber}")
        ResponseEntity<?> getPaymentHistory(
                        @PathVariable String orderNumber);

}
