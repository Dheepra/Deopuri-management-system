package com.backend.deopuri.service.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.deopuri.api.model.OrderStatus;
import com.backend.deopuri.api.model.Orders;
import com.backend.deopuri.api.model.Product;
import com.backend.deopuri.api.model.ProductVariant;
import com.backend.deopuri.exception.ResourceNotFoundException;
import com.backend.deopuri.service.dao.OrdersDao;
import com.backend.deopuri.service.dao.ProductRepository;
import com.backend.deopuri.service.dao.ProductVariantDao;
import com.backend.deopuri.service.service.OrdersService;

@Service
public class OrdersServiceImpl implements OrdersService {

    private static final Logger log =
            LoggerFactory.getLogger(OrdersServiceImpl.class);

    @Autowired
    private OrdersDao dao;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantDao variantDao;

    // ================= PLACE ORDER =================
    @Override
    public Orders placeOrder(Orders order) {

        log.info("========== PLACE ORDER START ==========");
        log.info("PRODUCT ID : {}", order.getProduct().getId());
        log.info("VARIANT ID : {}", order.getVariant().getId());

        Product product = productRepository.findById(order.getProduct().getId())
                .orElseThrow(() -> {
                    log.error("PRODUCT NOT FOUND : {}", order.getProduct().getId());
                    return new ResourceNotFoundException("Product not found");
                });

        ProductVariant variant = variantDao.findById(order.getVariant().getId())
                .orElseThrow(() -> {
                    log.error("VARIANT NOT FOUND : {}", order.getVariant().getId());
                    return new ResourceNotFoundException("Variant not found");
                });

        order.setProduct(product);
        order.setVariant(variant);
        order.setTotalAmount(0.0);
        order.setStatus(OrderStatus.PENDING);

        Orders saved = dao.save(order);

        log.info("ORDER PLACED SUCCESSFULLY. ORDER ID : {}", saved.getId());
        log.info("========== PLACE ORDER END ==========");

        return saved;
    }

    // ================= UPDATE TOTAL AMOUNT =================
    @Override
    public Orders updateTotalAmount(Long id, Double amount) {

        log.info("========== UPDATE TOTAL AMOUNT START ==========");
        log.info("ORDER ID : {}", id);
        log.info("NEW AMOUNT : {}", amount);

        Orders order = dao.findById(id)
                .orElseThrow(() -> {
                    log.error("ORDER NOT FOUND : {}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.setTotalAmount(amount);

        Orders updated = dao.save(order);

        log.info("TOTAL AMOUNT UPDATED SUCCESSFULLY");
        log.info("========== UPDATE TOTAL AMOUNT END ==========");

        return updated;
    }

    // ================= GET ALL ORDERS =================
    @Override
    public List<Orders> getAllOrders() {

        log.info("FETCHING ALL ORDERS");

        List<Orders> list = dao.findAll();

        log.info("TOTAL ORDERS FOUND : {}", list.size());

        return list;
    }

    // ================= GET USER ORDERS =================
    @Override
    public List<Orders> getUserOrders(int userId) {

        log.info("FETCHING ORDERS FOR USER ID : {}", userId);

        List<Orders> list = dao.findByUserId(userId);

        log.info("ORDERS FOUND : {}", list.size());

        return list;
    }

    // ================= UPDATE ORDER STATUS =================
    @Override
    public Orders updateOrderStatus(Long id, OrderStatus status) {

        log.info("========== UPDATE ORDER STATUS START ==========");
        log.info("ORDER ID : {}", id);
        log.info("NEW STATUS : {}", status);

        Orders order = dao.findById(id)
                .orElseThrow(() -> {
                    log.error("ORDER NOT FOUND : {}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        order.setStatus(status);

        Orders updated = dao.save(order);

        log.info("ORDER STATUS UPDATED SUCCESSFULLY");
        log.info("========== UPDATE ORDER STATUS END ==========");

        return updated;
    }

    // ================= DELETE ORDER =================
    @Override
    public void deleteOrder(Long id) {

        log.info("========== DELETE ORDER START ==========");
        log.info("ORDER ID : {}", id);

        Orders order = dao.findById(id)
                .orElseThrow(() -> {
                    log.error("ORDER NOT FOUND : {}", id);
                    return new ResourceNotFoundException("Order not found");
                });

        dao.delete(order);

        log.info("ORDER DELETED SUCCESSFULLY");
        log.info("========== DELETE ORDER END ==========");
    }
}