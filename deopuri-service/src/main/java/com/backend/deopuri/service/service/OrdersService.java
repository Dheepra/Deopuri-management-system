package com.backend.deopuri.service.service;

import java.util.List;

import com.backend.deopuri.api.model.OrderStatus;
import com.backend.deopuri.api.model.Orders;

public interface OrdersService {

    Orders placeOrder(Orders order);

    List<Orders> getAllOrders();

    List<Orders> getUserOrders(int userId);

    Orders updateTotalAmount(Long id, Double amount);

    Orders updateOrderStatus(Long id, OrderStatus status);

    void deleteOrder(Long id);
}