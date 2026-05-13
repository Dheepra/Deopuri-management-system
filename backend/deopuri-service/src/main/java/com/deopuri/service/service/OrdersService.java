package com.deopuri.service.service;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.model.OrderStatus;

import java.util.List;

public interface OrdersService {

    OrderResponse placeOrder(OrderRequest request);

    OrderResponse updateOrderStatus(Long id, OrderStatus status);

    OrderResponse updateTotalAmount(Long id, Double amount);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getUserOrders(int userId);

    List<OrderResponse> getCurrentUserOrders();

    void deleteOrder(Long id);
}
