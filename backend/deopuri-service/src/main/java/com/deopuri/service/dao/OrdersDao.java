package com.deopuri.service.dao;

import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersDao extends JpaRepository<Orders, Long> {

    List<Orders> findByUser_Id(int userId);

    List<Orders> findByStatus(OrderStatus status);
}
