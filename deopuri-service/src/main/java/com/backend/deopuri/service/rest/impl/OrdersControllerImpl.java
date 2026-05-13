package com.backend.deopuri.service.rest.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.backend.deopuri.api.model.OrderStatus;
import com.backend.deopuri.api.model.Orders;
import com.backend.deopuri.api.rest.OrdersApiPaths;
import com.backend.deopuri.api.rest.OrdersController;
import com.backend.deopuri.service.service.OrdersService;

@RestController
@RequestMapping(OrdersApiPaths.BASE)
public class OrdersControllerImpl implements OrdersController {

    private static final Logger log =
            LoggerFactory.getLogger(OrdersControllerImpl.class);

    @Autowired
    private OrdersService service;

    // ================= PLACE ORDER =================
    @Override
    @PostMapping(OrdersApiPaths.PLACE_ORDER)
    public Orders placeOrder(@RequestBody Orders order) {

        log.info("REQUEST: PLACE ORDER API CALLED");
        log.info("ORDER REQUEST DATA: {}", order);

        Orders response = service.placeOrder(order);

        log.info("RESPONSE: ORDER CREATED WITH ID: {}", response.getId());

        return response;
    }

    // ================= UPDATE AMOUNT =================
    @PutMapping(OrdersApiPaths.TOTAl_AMOUNT)
    public Orders updateAmount(
            @PathVariable Long id,
            @RequestParam Double amount) {

        log.info("REQUEST: UPDATE AMOUNT API CALLED");
        log.info("ORDER ID: {}, AMOUNT: {}", id, amount);

        Orders updated = service.updateTotalAmount(id, amount);

        log.info("RESPONSE: AMOUNT UPDATED SUCCESSFULLY");

        return updated;
    }

    // ================= GET ALL ORDERS =================
    @Override
    @GetMapping(OrdersApiPaths.GET_ALL)
    public List<Orders> getAllOrders() {

        log.info("REQUEST: GET ALL ORDERS API CALLED");

        List<Orders> list = service.getAllOrders();

        log.info("RESPONSE: TOTAL ORDERS FOUND: {}", list.size());

        return list;
    }

    // ================= GET USER ORDERS =================
    @Override
    @GetMapping(OrdersApiPaths.GET_USER_ORDERS)
    public List<Orders> getUserOrders(@PathVariable int userId) {

        log.info("REQUEST: GET USER ORDERS API CALLED");
        log.info("USER ID: {}", userId);

        List<Orders> list = service.getUserOrders(userId);

        log.info("RESPONSE: USER ORDERS FOUND: {}", list.size());

        return list;
    }

    // ================= UPDATE STATUS =================
    @Override
    @PutMapping(OrdersApiPaths.UPDATE_STATUS)
    public Orders updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        log.info("REQUEST: UPDATE ORDER STATUS API CALLED");
        log.info("ORDER ID: {}, STATUS: {}", id, status);

        Orders response = service.updateOrderStatus(id, status);

        log.info("RESPONSE: ORDER STATUS UPDATED SUCCESSFULLY");

        return response;
    }

    // ================= DELETE ORDER =================
    @Override
    @DeleteMapping(OrdersApiPaths.DELETE_ORDER)
    public String deleteOrder(@PathVariable Long id) {

        log.info("REQUEST: DELETE ORDER API CALLED");
        log.info("ORDER ID: {}", id);

        service.deleteOrder(id);

        log.info("RESPONSE: ORDER DELETED SUCCESSFULLY");

        return "Order Deleted Successfully";
    }
}