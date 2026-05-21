package com.deopuri.service.service.impl;

import com.deopuri.api.dto.*;
import com.deopuri.api.model.*;
import com.deopuri.service.dao.*;
import com.deopuri.service.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
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

        Users user = usersDao.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Product product = productDao.findById(dto.productId())
                .orElseThrow(() -> new RuntimeException("Product Not Found"));

        ProductVariant variant = variantDao.findById(dto.variantId())
                .orElseThrow(() -> new RuntimeException("Variant Not Found"));

        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Admin Cannot Add To Cart");
        }

        if (dto.quantity() <= 0) {
            throw new RuntimeException("Quantity Must Be Greater Than 0");
        }

        if (dto.size() == null || dto.size().isEmpty()) {
            throw new RuntimeException("Size Required");
        }

        if (variant.getProduct() == null ||
                !variant.getProduct().getId().equals(product.getId())) {
            throw new RuntimeException("Variant Does Not Belong To Product");
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

        Users user = usersDao.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Admin Cannot Add To Cart");
        }

        List<Orders> savedOrders = new ArrayList<>();

        for (CartItemRequest item : dto.items()) {

            Product product = productDao.findById(item.productId())
                    .orElseThrow(() -> new RuntimeException("Product Not Found"));

            ProductVariant variant = variantDao.findById(item.variantId())
                    .orElseThrow(() -> new RuntimeException("Variant Not Found"));

            if (item.quantity() <= 0) {
                throw new RuntimeException("Quantity Must Be Greater Than 0");
            }

            if (variant.getProduct() == null ||
                    !variant.getProduct().getId().equals(product.getId())) {
                throw new RuntimeException("Invalid Product-Variant Combination");
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

        Users user = usersDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        return ordersDao.findByUserAndStatus(user, OrderStatus.PENDING)
                .stream()
                .map(this::toCartResponse)
                .toList();
    }

    // ================= REMOVE ITEM =================
    @Override
    public String removeItem(Long orderId) {

        ordersDao.deleteById(orderId);
        return "Removed Successfully";
    }

    // ================= RESPONSE MAPPER =================
    private CartResponse toCartResponse(Orders o) {

        return new CartResponse(
                o.getId(),
                o.getUser().getId(),
                o.getProduct().getId(),
                o.getProduct().getName(),
                o.getVariant().getId(),
                o.getQuantity(),
                o.getTotalAmount(),
                o.getStatus()
        );
    }
}