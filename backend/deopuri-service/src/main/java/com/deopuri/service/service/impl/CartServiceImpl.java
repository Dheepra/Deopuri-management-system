package com.deopuri.service.service.impl;

import com.deopuri.api.dto.*;
import com.deopuri.api.model.*;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.*;
import com.deopuri.service.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

        @Autowired
        private ProductRepository productDao;

        @Autowired
        private UsersDao usersDao;

        @Autowired
        private OrdersDao ordersDao;

        @Autowired
        private ProductVariantDao variantDao;

        // ================= SINGLE ADD =================
        @Override
        public List<CartResponse> addToCart(CartDto dto) {

                // IDOR fix: act on the authenticated user, never a body-supplied id.
                Users user = currentUser();

                Product product = productDao.findById(dto.productId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id " + dto.productId()));

                ProductVariant variant = variantDao.findById(dto.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product variant not found with id " + dto.variantId()));

                if (user.getRole() == UserRole.ADMIN) {
                        throw new BusinessException("cart_admin_forbidden",
                                        "Admin accounts cannot add items to a cart.");
                }

                if (dto.quantity() <= 0) {
                        throw new BusinessException("cart_quantity_invalid",
                                        "Quantity must be greater than zero.");
                }

                if (dto.size() == null || dto.size().isEmpty()) {
                        throw new BusinessException("cart_size_required",
                                        "Please choose a size before adding to the cart.");
                }

                if (variant.getProduct() == null ||
                                !variant.getProduct().getId().equals(product.getId())) {
                        throw new BusinessException("cart_variant_mismatch",
                                        "The selected variant does not belong to the chosen product.");
                }

                Orders existingOrder = ordersDao
                                .findByUserAndProductAndVariantAndStatus(
                                                user, product, variant, OrderStatus.PENDING)
                                .orElse(null);

                if (existingOrder != null) {

                        int newQty = existingOrder.getQuantity() + dto.quantity();

                        existingOrder.setQuantity(newQty);
                        existingOrder.setTotalAmount(product.getPrice() * newQty);

                        ordersDao.save(existingOrder);

                } else {

                        Orders order = new Orders();

                        order.setUser(user);
                        order.setProduct(product);
                        order.setVariant(variant);
                        order.setQuantity(dto.quantity());
                        order.setTotalAmount(product.getPrice() * dto.quantity());
                        order.setStatus(OrderStatus.PENDING);

                        ordersDao.save(order);
                }

                return ordersDao.findByUserAndStatus(user, OrderStatus.PENDING)
                                .stream()
                                .map(this::toCartResponse)
                                .toList();
        }

        // ================= BULK ADD =================
        @Override
        public List<CartResponse> addBulk(BulkCartDto dto) {

                // IDOR fix: act on the authenticated user, never a body-supplied id.
                Users user = currentUser();

                if (user.getRole() == UserRole.ADMIN) {
                        throw new BusinessException("cart_admin_forbidden",
                                        "Admin accounts cannot add items to a cart.");
                }

                List<Orders> savedOrders = new ArrayList<>();

                for (CartItemRequest item : dto.items()) {

                        Product product = productDao.findById(item.productId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found with id " + item.productId()));

                        ProductVariant variant = variantDao.findById(item.variantId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product variant not found with id " + item.variantId()));

                        if (item.quantity() <= 0) {
                                throw new BusinessException("cart_quantity_invalid",
                                                "Quantity must be greater than zero.");
                        }

                        if (variant.getProduct() == null ||
                                        !variant.getProduct().getId().equals(product.getId())) {
                                throw new BusinessException("cart_variant_mismatch",
                                                "The selected variant does not belong to the chosen product.");
                        }

                        Orders existingOrder = ordersDao
                                        .findByUserAndProductAndVariantAndStatus(
                                                        user, product, variant, OrderStatus.PENDING)
                                        .orElse(null);

                        if (existingOrder != null) {

                                int newQty = existingOrder.getQuantity() + item.quantity();

                                existingOrder.setQuantity(newQty);
                                existingOrder.setTotalAmount(product.getPrice() * newQty);

                                savedOrders.add(existingOrder);

                        } else {

                                Orders order = new Orders();

                                order.setUser(user);
                                order.setProduct(product);
                                order.setVariant(variant);
                                order.setQuantity(item.quantity());
                                order.setTotalAmount(product.getPrice() * item.quantity());
                                order.setStatus(OrderStatus.PENDING);

                                savedOrders.add(order);
                        }
                }

                ordersDao.saveAll(savedOrders);

                return savedOrders.stream()
                                .map(this::toCartResponse)
                                .toList();
        }

        // ================= GET CART =================
        @Override
        public List<CartResponse> getCart(Integer userId) {

                // IDOR fix: ignore the path userId; scope to the authenticated user.
                Users user = currentUser();

                return ordersDao.findByUserAndStatus(user, OrderStatus.PENDING)
                                .stream()
                                .map(this::toCartResponse)
                                .toList();
        }

        // ================= REMOVE ITEM =================
        @Override
        public String removeItem(Long orderId) {

                // IDOR fix: only allow removing a row that belongs to the caller.
                Users user = currentUser();

                Orders order = ordersDao.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Cart item not found with id " + orderId));

                if (order.getUser() == null
                                || order.getUser().getId() != user.getId()) {
                        throw new AccessDeniedException(
                                        "You cannot remove another user's cart item.");
                }

                ordersDao.delete(order);
                return "Removed Successfully";
        }

        // ================= CURRENT USER =================
        private Users currentUser() {
                String email = SecurityUtils.currentUserEmail();
                return usersDao.findByEmail(email)
                                .orElseThrow(() -> new AccessDeniedException(
                                                "Authenticated user no longer exists"));
        }

        // ================= RESPONSE MAPPER =================
        private CartResponse toCartResponse(Orders o) {

                return new CartResponse(
                                o.getId(),
                                o.getUser().getId(),
                                o.getProduct().getId(),
                                o.getProduct().getName(),
                                o.getVariant().getId(),
                                o.getVariant().getSize(),
                                o.getQuantity(),
                                o.getTotalAmount(),
                                o.getStatus());
        }
}