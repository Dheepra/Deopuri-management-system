package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.dto.OrderStatusUpdateRequest;
import com.deopuri.api.rest.OrdersController;
import com.deopuri.service.service.OrdersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OrdersControllerImpl implements OrdersController {

    private final OrdersService service;

    public OrdersControllerImpl(OrdersService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<OrderResponse> placeOrder(OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.placeOrder(request));
    }

    @Override
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @Override
    public ResponseEntity<List<OrderResponse>> getUserOrders(int userId) {
        return ResponseEntity.ok(service.getUserOrders(userId));
    }

    @Override
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(service.getCurrentUserOrders());
    }

    @Override
    public ResponseEntity<OrderResponse> updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(service.updateOrderStatus(id, request.status()));
    }

    @Override
    public ResponseEntity<OrderResponse> updateAmount(Long id, Double amount) {
        return ResponseEntity.ok(service.updateTotalAmount(id, amount));
    }

    @Override
    public ResponseEntity<Void> deleteOrder(Long id) {
        service.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
