package com.deopuri.service.service.impl;

import com.deopuri.api.dto.PaymentRequest;
import com.deopuri.api.dto.PaymentResponse;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Payment;
import com.deopuri.api.model.PaymentStatus;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.dao.PaymentDao;
import com.deopuri.service.service.EmailService;
import com.deopuri.service.service.NotificationService;
import com.deopuri.service.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentDao paymentDao;
    private final OrdersDao ordersDao;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public PaymentServiceImpl(
            PaymentDao paymentDao,
            OrdersDao ordersDao,
            NotificationService notificationService,
            EmailService emailService) {

        this.paymentDao = paymentDao;
        this.ordersDao = ordersDao;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Override
    public PaymentResponse addPayment(
            Long orderId,
            PaymentRequest request) {

        Orders order = ordersDao.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        double paid = order.getPaidAmount() + request.amount();

        if (paid > order.getTotalAmount()) {
            throw new RuntimeException(
                    "Payment cannot be greater than total amount.");
        }

        double remaining =
                order.getTotalAmount() - paid;

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setRemark(request.remark());
        payment.setBalanceAfterPayment(remaining);

        payment = paymentDao.save(payment);

        order.setPaidAmount(paid);
        order.setRemainingAmount(remaining);

        if (remaining == 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        }

        ordersDao.save(order);

        notificationService.saveNotification(
                "Payment Received",
                "Payment received for Order #" + order.getId(),
                order.getUser().getId());

        String body =
                "<h2>Payment Received</h2>"
                        + "<p>Order Id : " + order.getId() + "</p>"
                        + "<p>Total Amount : ₹" + order.getTotalAmount() + "</p>"
                        + "<p>Paid : ₹" + request.amount() + "</p>"
                        + "<p>Remaining : ₹" + remaining + "</p>";

        emailService.sendEmail(
                order.getUser().getEmail(),
                "Payment Received",
                body);

        return new PaymentResponse(
                payment.getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getRemark(),
                payment.getBalanceAfterPayment(),
                payment.getPaymentDate());
    }

    @Override
@Transactional(readOnly = true)
public List<PaymentResponse> getPaymentHistory(Long orderId) {

    List<Payment> payments =
            paymentDao.findByOrderIdOrderByPaymentDateDesc(orderId);

    return payments.stream()
            .map(payment -> new PaymentResponse(

                    payment.getId(),

                    payment.getAmount(),

                    payment.getPaymentMethod(),

                    payment.getRemark(),

                    payment.getBalanceAfterPayment(),

                    payment.getPaymentDate()

            ))
            .toList();
}
}