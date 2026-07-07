package com.deopuri.service.service;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.model.OrderStatus;

import java.time.LocalDate;
import java.util.List;

public interface OrdersService {

    OrderResponse placeOrder(OrderRequest request);

    void placeAllOrders(List<OrderRequest> requests);

    OrderResponse updateOrderStatus(Long id, OrderStatus status);

    OrderResponse updateTotalAmount(Long id, Double amount);

    List<OrderResponse> getAllOrders();

    String confirmOrder(int userId);

    List<OrderResponse> getUserOrders(int userId);

    List<OrderResponse> getCurrentUserOrders();

    void deleteOrder(Long id);

    List<OrderResponse> filterOrders(
            LocalDate from,
            LocalDate to);

   // void confirmOrderByOrderNumber(String orderNumber);

}
