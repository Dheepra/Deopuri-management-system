package com.backend.deopuri.api.rest;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.backend.deopuri.api.model.OrderStatus;
import com.backend.deopuri.api.model.Orders;

public interface OrdersController {

    Orders placeOrder(@RequestBody Orders order);

    List<Orders> getAllOrders();

    List<Orders> getUserOrders(@PathVariable int userId);

    Orders updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status);

    String deleteOrder(@PathVariable Long id);
}