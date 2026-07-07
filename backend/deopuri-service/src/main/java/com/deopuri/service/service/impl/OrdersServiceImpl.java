package com.deopuri.service.service.impl;

import com.deopuri.api.dto.OrderRequest;
import com.deopuri.api.dto.OrderResponse;
import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.PaymentStatus;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.api.model.UserRole;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;

import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.dao.ProductRepository;
import com.deopuri.service.dao.ProductVariantDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.NotificationService;
import com.deopuri.service.service.OrdersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrdersServiceImpl implements OrdersService {

        private static final Logger log = LoggerFactory.getLogger(OrdersServiceImpl.class);

        private final OrdersDao dao;
        private final ProductRepository productRepository;
        private final ProductVariantDao variantDao;
        private final UsersDao usersDao;
        private final NotificationService notificationService;

        public OrdersServiceImpl(
                        OrdersDao dao,
                        ProductRepository productRepository,
                        ProductVariantDao variantDao,
                        UsersDao usersDao,
                        NotificationService notificationService) {
                this.dao = dao;
                this.productRepository = productRepository;
                this.variantDao = variantDao;
                this.usersDao = usersDao;
                this.notificationService = notificationService;
        }

        @Override
        public OrderResponse placeOrder(OrderRequest request) {

                Users user = currentUser();

                String orderGroupId = UUID.randomUUID().toString();
                String date = LocalDate.now()
                                .format(DateTimeFormatter.ofPattern("yyMMdd"));

               String prefix = "ORD-" + date + "-";

                String lastOrderNumber = dao.findLastOrderNumberByPrefix(prefix);

                String orderNumber;

                if (lastOrderNumber == null) {
                        orderNumber = prefix + "001";
                } else {
                        int sequence = Integer.parseInt(lastOrderNumber.substring(prefix.length()));
                        orderNumber = prefix + String.format("%03d", sequence + 1);
                }
                Orders saved = createOrder(request, user, orderGroupId, orderNumber);

                List<Users> admins = usersDao.findByRole(UserRole.ADMIN);

                for (Users admin : admins) {
                        notificationService.saveNotification(
                                        "New Order Placed",
                                        "Order #" + saved.getId() + " placed by " + user.getFirstName(),
                                        admin.getId());
                }

                return toResponse(saved);
        }

        @Override
        @Transactional
        public void placeAllOrders(List<OrderRequest> requests) {
                String orderGroupId = UUID.randomUUID().toString();

                String date = LocalDate.now()
                                .format(DateTimeFormatter.ofPattern("yyMMdd"));

              String prefix = "ORD-" + date + "-";

                String lastOrderNumber = dao.findLastOrderNumberByPrefix(prefix);

                String orderNumber;

                if (lastOrderNumber == null) {
                        orderNumber = prefix + "001";
                } else {
                        int sequence = Integer.parseInt(lastOrderNumber.substring(prefix.length()));
                        orderNumber = prefix + String.format("%03d", sequence + 1);
                }

                Users user = currentUser();

                for (OrderRequest request : requests) {

                        createOrder(request, user, orderGroupId, orderNumber);

                }

                List<Users> admins = usersDao.findByRole(UserRole.ADMIN);

                for (Users admin : admins) {

                        notificationService.saveNotification(
                                        "New Order Placed",
                                        user.getFirstName() + " has placed an order for "
                                                        + requests.size() + " item(s).",
                                        admin.getId());

                }
                log.info("Bulk order placed userId={} totalItems={}",
                                user.getId(),
                                requests.size());
        }

        @Override
        public String confirmOrder(int userId) {

                Users user = usersDao.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User Not Found"));

                List<Orders> cartItems = dao.findByUserAndStatus(user, OrderStatus.PENDING);

                if (cartItems.isEmpty()) {
                        throw new BusinessException("cart_empty",
                                        "Your cart is empty. Add at least one item before checkout.");
                }

                double total = 0;

                for (Orders order : cartItems) {

                        if (order.getTotalAmount() == null || order.getTotalAmount() <= 0) {
                                throw new BusinessException(
                                                "amount_required",
                                                "Please assign total amount before confirming the order.");
                        }

                        order.setStatus(OrderStatus.CONFIRMED);
                        total += order.getTotalAmount();
                }

                dao.saveAll(cartItems);

                return "Order Confirmed. Total = " + total;
        }

        @Override
        @Transactional
        public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
                log.info("updateOrderStatus called -> id={}, status={}", id, status);
                Orders order = loadOrder(id);

                // Same group ke saare orders nikalo
                List<Orders> groupOrders = dao.findByOrderGroupId(order.getOrderGroupId());

                // Confirm karne se pehle sabhi orders ka amount check karo
                if (status == OrderStatus.CONFIRMED) {

                        for (Orders o : groupOrders) {
                                if (o.getTotalAmount() == null || o.getTotalAmount() <= 0) {
                                        throw new BusinessException(
                                                        "amount_required",
                                                        "Please assign total amount before confirming the order.");
                                }
                        }

                        // Group ke saare orders confirm karo
                        for (Orders o : groupOrders) {
                                o.setStatus(OrderStatus.CONFIRMED);
                        }

                        dao.saveAll(groupOrders);
                        log.info("Sending notification for orderNumber={}", order.getOrderNumber());

                        // Sirf EK notification
                        notificationService.saveNotification(
                                        "Order Confirmed",
                                        "Your order has been confirmed.",
                                        order.getUser().getId());

                        log.info("Bulk order confirmed userId={} totalItems={}",
                                        order.getUser().getId(),
                                        groupOrders.size());

                } else {

                        order.setStatus(status);

                        if (status == OrderStatus.DELIVERED) {
                                order.setDeliveredDate(LocalDateTime.now());
                        }

                        dao.save(order);

                        log.info("Order status updated id={} status={}", id, status);
                }

                return toResponse(order);
        }

        @Override
        @Transactional
        public OrderResponse updateTotalAmount(Long id, Double amount) {

                if (amount == null || amount < 0) {
                        throw new IllegalArgumentException("Amount must be non-negative");
                }

                // Jis product ka amount update ho raha hai
                Orders order = loadOrder(id);

                // Product amount update karo
                order.setProductAmount(amount);
                dao.save(order);

                // Same order ke saare products nikalo
                List<Orders> orders = dao.findAllByOrderNumber(order.getOrderNumber());
                // Total calculate karo
                double total = orders.stream()
                                .mapToDouble(o -> o.getProductAmount() == null ? 0.0 : o.getProductAmount())
                                .sum();

                // Sabhi rows me total update karo
                for (Orders o : orders) {

                        o.setTotalAmount(total);

                        if (o.getPaidAmount() == null) {
                                o.setPaidAmount(0.0);
                        }

                        o.setRemainingAmount(total - o.getPaidAmount());
                }

                dao.saveAll(orders);

                log.info("Order {} total updated = {}", order.getOrderNumber(), total);

                return toResponse(order);
        }

        @Override
        @Transactional(readOnly = true)
        public List<OrderResponse> getAllOrders() {
                return dao.findAll().stream().map(OrdersServiceImpl::toResponse).toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<OrderResponse> getUserOrders(int userId) {
                return dao.findByUser_Id(userId).stream().map(OrdersServiceImpl::toResponse).toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<OrderResponse> getCurrentUserOrders() {

                Users user = currentUser();

                String role = SecurityUtils.currentUserRole();

                String context = role.contains("HOSPITAL")
                                ? "HOSPITAL"
                                : "MEDICAL";

                return dao.findByUserAndContext(user, context)
                                .stream()
                                .map(OrdersServiceImpl::toResponse)
                                .toList();
        }

        @Override
        public void deleteOrder(Long id) {
                Orders order = loadOrder(id);
                dao.delete(order);
                log.info("Order deleted id={}", id);
        }

        private Orders loadOrder(Long id) {
                return dao.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
        }

        private Users currentUser() {
                String email = SecurityUtils.currentUserEmail();
                return usersDao.findByEmail(email)
                                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
        }

        private static OrderResponse toResponse(Orders o) {
                return new OrderResponse(
                                o.getId(),

                                o.getUser().getId(),
                                o.getUser().getFirstName() + " " + o.getUser().getLastName(),

                                o.getProduct().getId(),
                                o.getProduct().getName(),

                                o.getVariant().getId(),
                                o.getVariant().getSize(),

                                o.getQuantity(),

                                o.getDeliveryAddress(),

                                o.getTotalAmount(),
                                o.getStatus(),
                                o.getOrderDate(),
                                o.getDeliveredDate(),
                                o.getOrderGroupId(),
                                o.getOrderNumber(),
                                o.getProductAmount());
        }

        private Orders createOrder(
                        OrderRequest request,
                        Users user,
                        String orderGroupId,
                        String orderNumber) {

                Product product = productRepository
                                .findById(request.productId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Product not found with id " + request.productId()));

                ProductVariant variant = variantDao
                                .findById(request.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variant not found with id " + request.variantId()));

                if (variant.getProduct() == null
                                || !variant.getProduct().getId().equals(product.getId())) {

                        throw new IllegalArgumentException(
                                        "Variant does not belong to the given product");
                }

                Orders order = new Orders();

                order.setUser(user);
                order.setProduct(product);
                order.setVariant(variant);
                order.setQuantity(request.quantity());
                order.setStatus(OrderStatus.PENDING);
                order.setDeliveryAddress(user.getAddress());
                order.setOrderNumber(orderNumber);

                String role = SecurityUtils.currentUserRole();

                if (role.contains("HOSPITAL")) {
                        order.setContext("HOSPITAL");
                } else {
                        order.setContext("MEDICAL");
                }

                order.setProductAmount(0.0);
                order.setTotalAmount(null);

                order.setPaidAmount(0.0);

                order.setRemainingAmount(0.0);

                order.setPaymentStatus(PaymentStatus.PENDING);

                order.setOrderGroupId(orderGroupId);

                return dao.save(order);
        }

        @Override
        public List<OrderResponse> filterOrders(
                        LocalDate from,
                        LocalDate to) {

                LocalDateTime start = from.atStartOfDay();

                LocalDateTime end = to.atTime(23, 59, 59);

                return dao
                                .findByOrderDateBetween(start, end)
                                .stream()
                                .map(OrdersServiceImpl::toResponse)
                                .toList();
        }
        
}
