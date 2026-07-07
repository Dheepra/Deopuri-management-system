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
                        String orderNumber,
                        PaymentRequest request) {

                List<Orders> orders = ordersDao.findAllByOrderNumber(orderNumber);

                if (orders.isEmpty()) {
                        throw new RuntimeException("Order not found");
                }

                Orders order = orders.get(0);
                double paid = order.getPaidAmount() + request.amount();

                if (paid > order.getTotalAmount()) {
                        throw new RuntimeException(
                                        "Payment cannot be greater than total amount.");
                }

                double remaining = order.getTotalAmount() - paid;

                Payment payment = new Payment();

                payment.setOrder(order);
                payment.setAmount(request.amount());
                payment.setPaymentMethod(request.paymentMethod());
                payment.setRemark(request.remark());
                payment.setBalanceAfterPayment(remaining);

                payment = paymentDao.save(payment);

                for (Orders o : orders) {

                        o.setPaidAmount(paid);
                        o.setRemainingAmount(remaining);

                        if (remaining == 0) {
                                o.setPaymentStatus(PaymentStatus.PAID);
                        } else {
                                o.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
                        }
                }

                ordersDao.saveAll(orders);

                notificationService.saveNotification(
                                "Payment Received",
                                "Payment received for Order #" + order.getOrderNumber(),
                                order.getUser().getId());

                String body = "<h2>Payment Received</h2>"
                                + "<p>Order Number : " + order.getOrderNumber() + "</p>"
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
        public List<PaymentResponse> getPaymentHistory(String orderNumber) {
                paymentDao.findByOrderOrderNumberOrderByPaymentDateDesc(orderNumber);

                List<Payment> payments = paymentDao.findByOrderOrderNumberOrderByPaymentDateDesc(orderNumber);

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