package com.deopuri.api.rest;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.dto.OrderStatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@RequestMapping("/deopuri/orders")
public interface OrdersController {

        @PostMapping
        @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
        ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request);

        @PostMapping("/place-all")
        @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
        ResponseEntity<String> placeAllOrders(
                        @Valid @RequestBody List<OrderRequest> requests);

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<List<OrderResponse>> getAllOrders();
        // CONFIRM CART ORDER

        @PostMapping("/confirm/{userId}")
        ResponseEntity<String> confirmOrder(
                        @PathVariable int userId);

        @GetMapping("/user/{userId}")
        @PreAuthorize("hasAnyRole('HOSPITAL_ADMIN','MEDICAL_ADMIN')")
        ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable int userId);

        @GetMapping("/me")
        @PreAuthorize("isAuthenticated()")
        ResponseEntity<List<OrderResponse>> getMyOrders();

        @PutMapping("/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                        @Valid @RequestBody OrderStatusUpdateRequest request);

        @PutMapping("/{id}/amount")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<OrderResponse> updateAmount(@PathVariable Long id, @RequestParam Double amount);

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        ResponseEntity<Void> deleteOrder(@PathVariable Long id);

        @GetMapping("/filter")
        @PreAuthorize("isAuthenticated()")
        ResponseEntity<List<OrderResponse>> filterOrders(
                        @RequestParam LocalDate from,
                        @RequestParam LocalDate to);

        // @PutMapping("/{orderNumber}/confirm")
        // @PreAuthorize("hasRole('ADMIN')")
        // ResponseEntity<String> confirmOrderByOrderNumber(
        //                 @PathVariable String orderNumber);
}
