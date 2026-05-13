package com.backend.deopuri.service.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.deopuri.api.model.OrderStatus;
import com.backend.deopuri.api.model.Orders;

@Repository
public interface OrdersDao extends JpaRepository<Orders, Long> {

    List<Orders> findByUserId(int userId);

    List<Orders> findByStatus(OrderStatus status);

}