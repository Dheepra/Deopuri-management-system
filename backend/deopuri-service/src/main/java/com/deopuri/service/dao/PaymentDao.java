package com.deopuri.service.dao;

import com.deopuri.api.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentDao extends JpaRepository<Payment, Long> {

  

    List<Payment> findByOrderOrderNumberOrderByPaymentDateDesc(String orderNumber);
}