package com.deopuri.service.service.impl;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
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

                Product product = productRepository
                                .findById(request.productId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id "
                                                                + request.productId()));

                ProductVariant variant = variantDao
                                .findById(request.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variant not found with id "
                                                                + request.variantId()));

                if (variant.getProduct() == null
                                || !variant.getProduct()
                                                .getId()
                                                .equals(product.getId())) {

                        throw new IllegalArgumentException(
                                        "Variant does not belong to the given product");
                }
                Orders order = new Orders();
                order.setUser(user);
                order.setProduct(product);
                order.setVariant(variant);
                order.setQuantity(request.quantity());
                order.setStatus(OrderStatus.PENDING);
                order.setDeliveryAddress(user.getAddress());

                String role = SecurityUtils.currentUserRole();

                String context = "MEDICAL";

                if ("ROLE_HOSPITAL_ADMIN".equals(role)) {
                        context = "HOSPITAL";
                }

                order.setContext(context);

                order.setTotalAmount(0.0);

              

                if (role.contains("HOSPITAL")) {
                        order.setContext("HOSPITAL");
                } else {
                        order.setContext("MEDICAL");
                }
                // update order quantity first
                int finalQuantity = order.getQuantity() + request.quantity();

                // FIXED STOCK CHECK
                if (variant.getStock() < request.quantity()) {
                        throw new InsufficientStockException("Insufficient stock");
                }

                // update stock
                variant.setStock(variant.getStock() - request.quantity());
                variantDao.save(variant); // ⭐ IMPORTANT FIX

                order.setQuantity(finalQuantity);
                order.setTotalAmount(finalQuantity * product.getPrice());

                

                Orders saved = dao.save(order);

                log.info(
                                "Order placed id={} userId={} productId={} quantity={}",
                                saved.getId(),
                                user.getId(),
                                product.getId(),
                                finalQuantity);

                return toResponse(saved);
        }

        @Override
        public String confirmOrder(int userId) {

                Users user = usersDao.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User Not Found"));

                List<Orders> cartItems = dao.findByUserAndStatus(user, OrderStatus.PENDING);

                if (cartItems.isEmpty()) {
                        throw new BusinessException("cart_empty",
                                        "Your cart is empty. Add at least one item before checkout.");
                }

                double total = 0;

                for (Orders order : cartItems) {
                        order.setStatus(OrderStatus.CONFIRMED);
                        total += order.getTotalAmount();
                }

                dao.saveAll(cartItems);

                return "Order Confirmed. Total = " + total;
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

                Users user = currentUser();

                String role = SecurityUtils.currentUserRole();

                String context = role.contains("HOSPITAL")
                                ? "HOSPITAL"
                                : "MEDICAL";

                return dao.findByUserAndContext(user, context)
                                .stream()
                                .map(OrdersServiceImpl::toResponse)
                                .toList();
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
                                o.getUser().getFirstName() + " " + o.getUser().getLastName(),

                                o.getProduct().getId(),
                                o.getProduct().getName(),

                                o.getVariant().getId(),
                                o.getVariant().getSize(),

                                o.getQuantity(),

                                o.getDeliveryAddress(),

                                o.getTotalAmount(),
                                o.getStatus(),
                                o.getOrderDate());
        }
}
