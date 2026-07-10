package com.deopuri.service.dao;

import com.deopuri.api.dto.TopCustomerResponse;
import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.api.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersDao extends JpaRepository<Orders, Long> {

        List<Orders> findByUser_Id(int userId);

        List<Orders> findByStatus(OrderStatus status);

        List<Orders> findByUserAndStatus(
                        Users user,
                        OrderStatus status);

        List<Orders> findByUserAndContext(Users user, String context);

        List<Orders> findByContext(String context);

        Optional<Orders> findByUserAndProductAndVariantAndStatus(
                        Users user,
                        Product product,
                        ProductVariant variant,
                        OrderStatus status);

        List<Orders> findByOrderDateBetween(
                        LocalDateTime start,
                        LocalDateTime end);

        List<Orders> findByOrderGroupId(String orderGroupId);

        List<Orders> findAllByOrderNumber(String orderNumber);

        @Query(value = """
                        SELECT order_number
                        FROM orders
                        WHERE order_number LIKE CONCAT(:prefix, '%')
                        ORDER BY order_number DESC
                        LIMIT 1
                        """, nativeQuery = true)
        String findLastOrderNumberByPrefix(@Param("prefix") String prefix);

        @Query("""
                        SELECT new com.deopuri.api.dto.TopCustomerResponse(
                            0,
                            o.user.id,
                            CONCAT(o.user.firstName, ' ', o.user.lastName),
                            o.user.shopName,
                            COALESCE(SUM(o.totalAmount),0),
                            COUNT(o.id)
                        )
                        FROM Orders o
                        WHERE o.orderDate >= :fromDate
                        GROUP BY o.user.id, o.user.firstName, o.user.lastName, o.user.shopName
                        ORDER BY SUM(o.totalAmount) DESC
                        """)
        List<TopCustomerResponse> findTopCustomers(
                        @Param("fromDate") LocalDateTime fromDate,
                        Pageable pageable);
}