package com.deopuri.service.service.impl;

import com.deopuri.api.dto.PaymentRequest;
import com.deopuri.api.dto.PaymentResponse;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Payment;
import com.deopuri.api.model.PaymentStatus;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.dao.PaymentDao;
import com.deopuri.service.service.EmailService;

import com.deopuri.service.service.PaymentService;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

        private final PaymentDao paymentDao;
        private final OrdersDao ordersDao;

        private final EmailService emailService;

        public PaymentServiceImpl(
                        PaymentDao paymentDao,
                        OrdersDao ordersDao,

                        EmailService emailService) {

                this.paymentDao = paymentDao;
                this.ordersDao = ordersDao;

                this.emailService = emailService;
        }

        @Override
        public PaymentResponse addPayment(
                        String orderNumber,
                        PaymentRequest request) {

                List<Orders> orders = ordersDao.findAllByOrderNumber(orderNumber);

                if (orders.isEmpty()) {
                        throw new ResourceNotFoundException("Order not found");
                }

                Orders order = orders.get(0);
                double paid = order.getPaidAmount() + request.amount();

                if (paid > order.getTotalAmount()) {
                        throw new BusinessException("payment_exceeds_total",
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

                String subject = "Payment Received Successfully";

                String customerName = order.getUser().getFirstName() + " " + order.getUser().getLastName();

                String paymentStatus = remaining == 0 ? "PAID" : "PARTIALLY PAID";

                String body = """
                                <html>
                                <body style="font-family: Arial, sans-serif;">

                                    <div style="text-align:center;">

                                        <img src="cid:logoImage"
                                             alt="Company Logo"
                                             style="width:120px;height:auto;margin-bottom:10px;">

                                        <h2 style="color:#2e7d32;">
                                            Deopuri Herbal Drugs and Pharmaceuticals
                                        </h2>

                                        <hr style="width:60%%; margin:15px auto;"/>

                                        <h3 style="margin-top:20px;">
                                            Payment Received Successfully
                                        </h3>

                                        <p>Dear <b>%s</b>,</p>

                                        <p>Your payment has been received successfully.</p>

                                        <br>

                                        <p><b>Order Number:</b> %s</p>
                                        <p><b>Total Amount:</b> ₹%.2f</p>
                                        <p><b>Current Payment:</b> ₹%.2f</p>
                                        <p><b>Total Paid:</b> ₹%.2f</p>
                                        <p><b>Remaining Amount:</b> ₹%.2f</p>
                                        <p><b>Payment Status:</b> %s</p>

                                        <br>

                                        <p>
                                            Thank you for choosing
                                            <b>Deopuri Herbal Drugs and Pharmaceuticals.</b>
                                        </p>

                                        <p>
                                            Regards,<br>
                                            <b>Deopuri Herbal Drugs and Pharmaceuticals</b>
                                        </p>

                                    </div>

                                </body>
                                </html>
                                """.formatted(
                                customerName,
                                order.getOrderNumber(),
                                order.getTotalAmount(),
                                request.amount(),
                                paid,
                                remaining,
                                paymentStatus);

                emailService.sendEmail(
                                order.getUser().getEmail(),
                                subject,
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

                // IDOR fix: only an ADMIN or the order's owner may view its payments.
                List<Orders> orders = ordersDao.findAllByOrderNumber(orderNumber);

                if (orders.isEmpty()) {
                        throw new ResourceNotFoundException("Order not found");
                }

                if (!"ROLE_ADMIN".equals(SecurityUtils.currentUserRole())) {
                        String email = SecurityUtils.currentUserEmail();
                        Orders order = orders.get(0);
                        if (order.getUser() == null
                                        || !email.equals(order.getUser().getEmail())) {
                                throw new AccessDeniedException(
                                                "You cannot view another order's payments.");
                        }
                }

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