package com.deopuri.service.dao;

import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.api.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersDao extends JpaRepository<Orders, Long> {

    List<Orders> findByUser_Id(int userId);

    List<Orders> findByStatus(OrderStatus status);

    List<Orders> findByUserAndStatus(
            Users user,
            OrderStatus status);

   Optional<Orders> findByUserAndProductAndVariantAndStatus(
        Users user,
        Product product,
        ProductVariant variant,
        OrderStatus status
);
}
