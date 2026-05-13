package com.deopuri.service.service.impl;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.api.model.Users;
import com.deopuri.exception.InsufficientStockException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.dao.ProductRepository;
import com.deopuri.service.dao.ProductVariantDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.OrdersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrdersServiceImpl implements OrdersService {

    private static final Logger log = LoggerFactory.getLogger(OrdersServiceImpl.class);

    private final OrdersDao dao;
    private final ProductRepository productRepository;
    private final ProductVariantDao variantDao;
    private final UsersDao usersDao;

    public OrdersServiceImpl(OrdersDao dao,
                             ProductRepository productRepository,
                             ProductVariantDao variantDao,
                             UsersDao usersDao) {
        this.dao = dao;
        this.productRepository = productRepository;
        this.variantDao = variantDao;
        this.usersDao = usersDao;
    }

    @Override
    public OrderResponse placeOrder(OrderRequest request) {
        Users user = currentUser();

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id " + request.productId()));

        ProductVariant variant = variantDao.findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Variant not found with id " + request.variantId()));

        if (variant.getProduct() == null
                || !variant.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Variant does not belong to the given product");
        }

        if (variant.getStock() < request.quantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock: available " + variant.getStock()
                            + ", requested " + request.quantity());
        }

        variant.setStock(variant.getStock() - request.quantity());

        Orders order = new Orders();
        order.setUser(user);
        order.setProduct(product);
        order.setVariant(variant);
        order.setQuantity(request.quantity());
        order.setTotalAmount(product.getPrice() * request.quantity());
        order.setStatus(OrderStatus.PENDING);

        Orders saved = dao.save(order);
        log.info("Order placed id={} userId={} productId={} quantity={}",
                saved.getId(), user.getId(), product.getId(), request.quantity());
        return toResponse(saved);
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Orders order = loadOrder(id);
        order.setStatus(status);
        log.info("Order status updated id={} status={}", id, status);
        return toResponse(order);
    }

    @Override
    public OrderResponse updateTotalAmount(Long id, Double amount) {
        if (amount == null || amount < 0) {
            throw new IllegalArgumentException("Amount must be non-negative");
        }
        Orders order = loadOrder(id);
        order.setTotalAmount(amount);
        log.info("Order total updated id={} amount={}", id, amount);
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return dao.findAll().stream().map(OrdersServiceImpl::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(int userId) {
        return dao.findByUser_Id(userId).stream().map(OrdersServiceImpl::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getCurrentUserOrders() {
        return getUserOrders(currentUser().getId());
    }

    @Override
    public void deleteOrder(Long id) {
        Orders order = loadOrder(id);
        dao.delete(order);
        log.info("Order deleted id={}", id);
    }

    private Orders loadOrder(Long id) {
        return dao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
    }

    private Users currentUser() {
        String email = SecurityUtils.currentUserEmail();
        return usersDao.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
    }

    private static OrderResponse toResponse(Orders o) {
        return new OrderResponse(
                o.getId(),
                o.getUser().getId(),
                o.getProduct().getId(),
                o.getVariant().getId(),
                o.getQuantity(),
                o.getTotalAmount(),
                o.getStatus(),
                o.getOrderDate());
    }
}
