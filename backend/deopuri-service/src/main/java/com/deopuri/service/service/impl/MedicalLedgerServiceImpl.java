package com.deopuri.service.service.impl;

import com.deopuri.api.dto.AddStockRequest;
import com.deopuri.api.dto.BillItemRequest;
import com.deopuri.api.dto.BillItemResponse;
import com.deopuri.api.dto.BillResponse;
import com.deopuri.api.dto.CreateBillRequest;
import com.deopuri.api.dto.KhataCustomerResponse;
import com.deopuri.api.dto.MedicalExpenseRequest;
import com.deopuri.api.dto.RecordKhataPaymentRequest;
import com.deopuri.api.dto.MedicalExpenseResponse;
import com.deopuri.api.dto.MedicalProfitLossResponse;
import com.deopuri.api.dto.MedicalSaleResponse;
import com.deopuri.api.dto.MedicalStockResponse;
import com.deopuri.api.dto.RecordSaleRequest;
import com.deopuri.api.dto.UpdateStockRequest;
import com.deopuri.api.model.MedicalBill;
import com.deopuri.api.model.MedicalExpense;
import com.deopuri.api.model.MedicalSale;
import com.deopuri.api.model.MedicalStock;
import com.deopuri.api.model.Orders;
import com.deopuri.api.model.Users;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.security.SecurityUtils;
import com.deopuri.service.dao.MedicalBillDao;
import com.deopuri.service.dao.MedicalExpenseDao;
import com.deopuri.service.dao.MedicalSaleDao;
import com.deopuri.service.dao.MedicalStockDao;
import com.deopuri.service.dao.UsersDao;
import com.deopuri.service.service.MedicalLedgerService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicalLedgerServiceImpl implements MedicalLedgerService {

    private static final Logger log = LoggerFactory.getLogger(MedicalLedgerServiceImpl.class);

    private final MedicalStockDao stockDao;
    private final MedicalSaleDao saleDao;
    private final MedicalExpenseDao expenseDao;
    private final MedicalBillDao billDao;
    private final UsersDao usersDao;

    public MedicalLedgerServiceImpl(MedicalStockDao stockDao,
                                    MedicalSaleDao saleDao,
                                    MedicalExpenseDao expenseDao,
                                    MedicalBillDao billDao,
                                    UsersDao usersDao) {
        this.stockDao = stockDao;
        this.saleDao = saleDao;
        this.expenseDao = expenseDao;
        this.billDao = billDao;
        this.usersDao = usersDao;
    }

    // ---- helpers ----------------------------------------------------------

    private Users currentUser() {
        String email = SecurityUtils.currentUserEmail();
        return usersDao.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user no longer exists"));
    }

    private Integer currentUserId() {
        return currentUser().getId();
    }

    private static double nz(Double v) {
        return v == null ? 0.0 : v;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // ---- stock ------------------------------------------------------------

    @Override
    public MedicalStockResponse addStock(AddStockRequest request) {
        Integer ownerId = currentUserId();

        MedicalStock stock = stockDao
                .findByOwnerIdAndProductName(ownerId, request.productName())
                .orElseGet(() -> {
                    MedicalStock s = new MedicalStock();
                    s.setOwnerId(ownerId);
                    s.setProductName(request.productName());
                    s.setQuantity(0);
                    return s;
                });

        stock.setQuantity(stock.getQuantity() + (request.quantity() == null ? 0 : request.quantity()));
        if (request.costPrice() != null) {
            stock.setCostPrice(request.costPrice());
        }
        // Default retail to cost so a margin exists to edit; explicit retail wins.
        if (request.retailPrice() != null) {
            stock.setRetailPrice(request.retailPrice());
        } else if (stock.getRetailPrice() == null) {
            stock.setRetailPrice(stock.getCostPrice());
        }
        if (request.expiryDate() != null) {
            stock.setExpiryDate(request.expiryDate());
        }

        return toStockResponse(stockDao.save(stock));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalStockResponse> listStock() {
        return stockDao.findByOwnerId(currentUserId()).stream()
                .map(this::toStockResponse)
                .toList();
    }

    @Override
    public MedicalStockResponse updateStock(Long id, UpdateStockRequest request) {
        MedicalStock stock = ownedStock(id);
        if (request.quantity() != null) {
            stock.setQuantity(request.quantity());
        }
        if (request.retailPrice() != null) {
            stock.setRetailPrice(request.retailPrice());
        }
        if (request.expiryDate() != null) {
            stock.setExpiryDate(request.expiryDate());
        }
        return toStockResponse(stockDao.save(stock));
    }

    @Override
    public void deleteStock(Long id) {
        stockDao.delete(ownedStock(id));
    }

    private MedicalStock ownedStock(Long id) {
        MedicalStock stock = stockDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));
        if (!stock.getOwnerId().equals(currentUserId())) {
            throw new AccessDeniedException("Not your stock item");
        }
        return stock;
    }

    // ---- sales ------------------------------------------------------------

    @Override
    public MedicalSaleResponse recordSale(RecordSaleRequest request) {
        Integer ownerId = currentUserId();
        int qty = request.quantity() == null ? 0 : request.quantity();
        if (qty <= 0) {
            throw new BusinessException("invalid_quantity", "Quantity must be at least 1");
        }

        MedicalStock stock = stockDao
                .findByOwnerIdAndProductName(ownerId, request.productName())
                .orElse(null);

        double costPrice = stock != null ? nz(stock.getCostPrice()) : 0.0;
        double salePrice = request.salePrice() != null
                ? request.salePrice()
                : (stock != null ? nz(stock.getRetailPrice()) : 0.0);

        MedicalSale sale = new MedicalSale();
        sale.setOwnerId(ownerId);
        sale.setProductName(request.productName());
        sale.setQuantity(qty);
        sale.setSalePrice(salePrice);
        sale.setCostPrice(costPrice);
        sale.setTotalAmount(round2(salePrice * qty));
        sale.setSaleDate(request.saleDate() != null ? request.saleDate() : LocalDate.now());

        MedicalSale saved = saleDao.save(sale);

        // Draw down inventory (never below zero).
        if (stock != null) {
            stock.setQuantity(Math.max(0, stock.getQuantity() - qty));
            stockDao.save(stock);
        }

        return toSaleResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalSaleResponse> listSales() {
        return saleDao.findByOwnerId(currentUserId()).stream()
                .map(this::toSaleResponse)
                .toList();
    }

    // ---- bills ------------------------------------------------------------

    @Override
    public BillResponse createBill(CreateBillRequest request) {
        Users user = currentUser();
        Integer ownerId = user.getId();
        LocalDate date = request.billDate() != null ? request.billDate() : LocalDate.now();
        String billNumber = generateBillNumber(ownerId, date);

        List<BillItemResponse> items = new ArrayList<>();
        double total = 0.0;
        double profit = 0.0;

        for (BillItemRequest item : request.items()) {
            int qty = item.quantity() == null ? 0 : item.quantity();
            if (qty <= 0) {
                continue;
            }

            MedicalStock stock = stockDao
                    .findByOwnerIdAndProductName(ownerId, item.productName())
                    .orElse(null);

            double cost = stock != null ? nz(stock.getCostPrice()) : 0.0;
            double price = item.salePrice() != null
                    ? item.salePrice()
                    : (stock != null ? nz(stock.getRetailPrice()) : 0.0);
            double lineTotal = round2(price * qty);
            double lineProfit = round2((price - cost) * qty);

            MedicalSale sale = new MedicalSale();
            sale.setOwnerId(ownerId);
            sale.setProductName(item.productName());
            sale.setQuantity(qty);
            sale.setSalePrice(price);
            sale.setCostPrice(cost);
            sale.setTotalAmount(lineTotal);
            sale.setSaleDate(date);
            sale.setBillNumber(billNumber);
            sale.setCustomerName(request.customerName());
            sale.setCustomerMobile(request.customerMobile());
            saleDao.save(sale);

            if (stock != null) {
                stock.setQuantity(Math.max(0, stock.getQuantity() - qty));
                stockDao.save(stock);
            }

            total += lineTotal;
            profit += lineProfit;
            items.add(new BillItemResponse(item.productName(), qty, price, cost, lineTotal, lineProfit));
        }

        if (items.isEmpty()) {
            throw new BusinessException("empty_bill", "A bill must have at least one item");
        }

        double grand = round2(total);
        // Default: fully paid (no credit). A smaller paidAmount records credit.
        double paid = request.paidAmount() != null ? Math.max(0, Math.min(request.paidAmount(), grand)) : grand;

        MedicalBill billRow = new MedicalBill();
        billRow.setOwnerId(ownerId);
        billRow.setBillNumber(billNumber);
        billRow.setCustomerName(request.customerName());
        billRow.setCustomerMobile(request.customerMobile());
        billRow.setBillDate(date);
        billRow.setTotalAmount(grand);
        billRow.setPaidAmount(round2(paid));
        billDao.save(billRow);

        return new BillResponse(billNumber, user.getShopName(),
                request.customerName(), request.customerMobile(), date,
                grand, round2(paid), round2(grand - paid), round2(profit), items.size(), items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> listBills() {
        Users user = currentUser();
        Map<String, List<MedicalSale>> byBill = saleDao.findByOwnerId(user.getId()).stream()
                .filter(s -> s.getBillNumber() != null)
                .collect(Collectors.groupingBy(MedicalSale::getBillNumber));
        Map<String, MedicalBill> billRows = billDao.findByOwnerId(user.getId()).stream()
                .collect(Collectors.toMap(MedicalBill::getBillNumber, b -> b, (a, b) -> a));

        return byBill.entrySet().stream()
                .map(e -> toBillResponse(e.getKey(), e.getValue(), user.getShopName(),
                        billRows.get(e.getKey())))
                .sorted((a, b) -> b.billNumber().compareTo(a.billNumber()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BillResponse getBill(String billNumber) {
        Users user = currentUser();
        List<MedicalSale> lines = saleDao.findByOwnerIdAndBillNumber(user.getId(), billNumber);
        if (lines.isEmpty()) {
            throw new ResourceNotFoundException("Bill not found");
        }
        MedicalBill row = billDao.findByOwnerIdAndBillNumber(user.getId(), billNumber).orElse(null);
        return toBillResponse(billNumber, lines, user.getShopName(), row);
    }

    private String generateBillNumber(Integer ownerId, LocalDate date) {
        String prefix = "BILL-" + date.format(DateTimeFormatter.ofPattern("yyMMdd")) + "-";
        long todaysBills = saleDao.findByOwnerId(ownerId).stream()
                .map(MedicalSale::getBillNumber)
                .filter(b -> b != null && b.startsWith(prefix))
                .distinct()
                .count();
        return prefix + String.format("%03d", todaysBills + 1);
    }

    private BillResponse toBillResponse(String billNumber, List<MedicalSale> lines, String shopName,
                                        MedicalBill billRow) {
        List<BillItemResponse> items = lines.stream()
                .map(s -> new BillItemResponse(
                        s.getProductName(), s.getQuantity(), s.getSalePrice(), s.getCostPrice(),
                        s.getTotalAmount(),
                        round2((nz(s.getSalePrice()) - nz(s.getCostPrice())) * s.getQuantity())))
                .toList();
        double total = items.stream().mapToDouble(i -> nz(i.lineTotal())).sum();
        double profit = items.stream().mapToDouble(i -> nz(i.lineProfit())).sum();
        // Legacy bills (created before khata) have no bill row — treat as fully paid.
        double paid = billRow != null ? nz(billRow.getPaidAmount()) : total;
        MedicalSale first = lines.get(0);
        return new BillResponse(billNumber, shopName,
                first.getCustomerName(), first.getCustomerMobile(), first.getSaleDate(),
                round2(total), round2(paid), round2(total - paid), round2(profit), items.size(), items);
    }

    // ---- khata (customer credit) -----------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<KhataCustomerResponse> listKhata() {
        Integer ownerId = currentUserId();
        return buildKhata(billDao.findByOwnerId(ownerId)).stream()
                .filter(k -> k.totalDue() > 0.009)
                .sorted((a, b) -> Double.compare(b.totalDue(), a.totalDue()))
                .toList();
    }

    @Override
    public KhataCustomerResponse recordKhataPayment(RecordKhataPaymentRequest request) {
        Integer ownerId = currentUserId();
        double remaining = request.amount() == null ? 0 : request.amount();
        if (remaining <= 0) {
            throw new BusinessException("invalid_amount", "Amount must be greater than 0");
        }

        List<MedicalBill> bills = billDao.findByOwnerId(ownerId).stream()
                .filter(b -> matchesCustomer(b, request.customerMobile(), request.customerName()))
                .filter(b -> due(b) > 0.009)
                .sorted(Comparator.comparing(MedicalBill::getBillNumber)) // oldest first
                .toList();

        for (MedicalBill b : bills) {
            if (remaining <= 0.009) {
                break;
            }
            double d = due(b);
            double pay = Math.min(remaining, d);
            b.setPaidAmount(round2(nz(b.getPaidAmount()) + pay));
            billDao.save(b);
            remaining -= pay;
        }

        return buildKhata(billDao.findByOwnerId(ownerId)).stream()
                .filter(k -> matchesKey(k, request.customerMobile(), request.customerName()))
                .findFirst()
                .orElse(new KhataCustomerResponse(
                        request.customerName(), request.customerMobile(), 0, 0, 0, 0, null));
    }

    private List<KhataCustomerResponse> buildKhata(List<MedicalBill> bills) {
        Map<String, List<MedicalBill>> byCustomer = new LinkedHashMap<>();
        for (MedicalBill b : bills) {
            byCustomer.computeIfAbsent(customerKey(b), k -> new ArrayList<>()).add(b);
        }
        List<KhataCustomerResponse> out = new ArrayList<>();
        for (List<MedicalBill> group : byCustomer.values()) {
            double billed = group.stream().mapToDouble(b -> nz(b.getTotalAmount())).sum();
            double paid = group.stream().mapToDouble(b -> nz(b.getPaidAmount())).sum();
            LocalDate last = group.stream().map(MedicalBill::getBillDate)
                    .filter(d -> d != null).max(Comparator.naturalOrder()).orElse(null);
            MedicalBill first = group.get(0);
            out.add(new KhataCustomerResponse(
                    first.getCustomerName(), first.getCustomerMobile(),
                    round2(billed), round2(paid), round2(billed - paid),
                    group.size(), last));
        }
        return out;
    }

    private static String customerKey(MedicalBill b) {
        String mob = b.getCustomerMobile();
        if (mob != null && !mob.isBlank()) {
            return "m:" + mob.trim();
        }
        String name = b.getCustomerName();
        if (name != null && !name.isBlank()) {
            return "n:" + name.trim().toLowerCase();
        }
        return "walkin";
    }

    private static boolean matchesCustomer(MedicalBill b, String mobile, String name) {
        if (mobile != null && !mobile.isBlank()) {
            return mobile.trim().equals(b.getCustomerMobile());
        }
        if (name != null && !name.isBlank()) {
            return name.trim().equalsIgnoreCase(b.getCustomerName());
        }
        return false;
    }

    private static boolean matchesKey(KhataCustomerResponse k, String mobile, String name) {
        if (mobile != null && !mobile.isBlank()) {
            return mobile.trim().equals(k.customerMobile());
        }
        if (name != null && !name.isBlank()) {
            return name.trim().equalsIgnoreCase(k.customerName());
        }
        return false;
    }

    private static double due(MedicalBill b) {
        return nz(b.getTotalAmount()) - nz(b.getPaidAmount());
    }

    // ---- expenses ---------------------------------------------------------

    @Override
    public MedicalExpenseResponse addExpense(MedicalExpenseRequest request) {
        MedicalExpense e = new MedicalExpense();
        e.setOwnerId(currentUserId());
        e.setExpenseName(request.expenseName());
        e.setExpenseType(request.expenseType());
        e.setAmount(request.amount());
        e.setDescription(request.description());
        e.setExpenseDate(request.expenseDate() != null ? request.expenseDate() : LocalDate.now());
        return toExpenseResponse(expenseDao.save(e));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalExpenseResponse> listExpenses() {
        return expenseDao.findByOwnerId(currentUserId()).stream()
                .map(this::toExpenseResponse)
                .toList();
    }

    @Override
    public void deleteExpense(Long id) {
        MedicalExpense e = expenseDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!e.getOwnerId().equals(currentUserId())) {
            throw new AccessDeniedException("Not your expense");
        }
        expenseDao.delete(e);
    }

    // ---- profit & loss ----------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public MedicalProfitLossResponse profitLoss(LocalDate from, LocalDate to) {
        Integer ownerId = currentUserId();

        List<MedicalSale> sales = saleDao.findByOwnerId(ownerId).stream()
                .filter(s -> inRange(s.getSaleDate(), from, to))
                .toList();
        List<MedicalExpense> expenses = expenseDao.findByOwnerId(ownerId).stream()
                .filter(e -> inRange(e.getExpenseDate(), from, to))
                .toList();
        List<MedicalStock> stock = stockDao.findByOwnerId(ownerId);

        double totalSales = sales.stream().mapToDouble(s -> nz(s.getTotalAmount())).sum();
        double totalCost = sales.stream().mapToDouble(s -> nz(s.getCostPrice()) * s.getQuantity()).sum();
        double totalExpense = expenses.stream().mapToDouble(e -> nz(e.getAmount())).sum();
        double stockValue = stock.stream().mapToDouble(s -> nz(s.getCostPrice()) * s.getQuantity()).sum();

        double grossProfit = totalSales - totalCost;
        double netProfit = grossProfit - totalExpense;
        double grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
        double netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
        int itemsSold = sales.stream().mapToInt(MedicalSale::getQuantity).sum();

        return new MedicalProfitLossResponse(
                round2(totalSales),
                round2(totalCost),
                round2(totalExpense),
                round2(grossProfit),
                round2(grossMargin),
                round2(netProfit),
                round2(netMargin),
                netProfit >= 0 ? "PROFIT" : "LOSS",
                round2(stockValue),
                round2(stockValue + totalCost),
                sales.size(),
                itemsSold);
    }

    private static boolean inRange(LocalDate d, LocalDate from, LocalDate to) {
        if (d == null) {
            return from == null && to == null;
        }
        if (from != null && d.isBefore(from)) {
            return false;
        }
        return to == null || !d.isAfter(to);
    }

    // ---- internal: auto-stock from a delivered purchase order -------------

    @Override
    public void ingestDeliveredOrder(Orders order) {
        try {
            if (order == null || order.getUser() == null) {
                return;
            }
            Integer ownerId = order.getUser().getId();
            String productName = order.getProduct() != null
                    ? order.getProduct().getName()
                    : "Unknown product";
            int qty = order.getQuantity();
            Double unitCost = order.getProductPrice();

            MedicalStock stock = stockDao
                    .findByOwnerIdAndProductName(ownerId, productName)
                    .orElseGet(() -> {
                        MedicalStock s = new MedicalStock();
                        s.setOwnerId(ownerId);
                        s.setProductName(productName);
                        s.setQuantity(0);
                        return s;
                    });

            stock.setQuantity(stock.getQuantity() + qty);
            if (unitCost != null) {
                stock.setCostPrice(unitCost);
                if (stock.getRetailPrice() == null) {
                    stock.setRetailPrice(unitCost); // default; admin edits up
                }
            }
            stock.setSourceOrderNumber(order.getOrderNumber());
            stockDao.save(stock);
        } catch (Exception ex) {
            // Never let stock-sync failures roll back the delivery itself.
            log.warn("Failed to auto-add delivered order to medical stock: {}", ex.getMessage());
        }
    }

    // ---- mappers ----------------------------------------------------------

    private MedicalStockResponse toStockResponse(MedicalStock s) {
        Double margin = (s.getRetailPrice() != null && s.getCostPrice() != null)
                ? round2(s.getRetailPrice() - s.getCostPrice())
                : null;
        Double marginPct = (margin != null && s.getCostPrice() != null && s.getCostPrice() > 0)
                ? round2((margin / s.getCostPrice()) * 100)
                : null;
        return new MedicalStockResponse(
                s.getId(), s.getProductName(), s.getQuantity(),
                s.getCostPrice(), s.getRetailPrice(), margin, marginPct,
                s.getExpiryDate(), s.getSourceOrderNumber());
    }

    private MedicalSaleResponse toSaleResponse(MedicalSale s) {
        double profit = (nz(s.getSalePrice()) - nz(s.getCostPrice())) * s.getQuantity();
        return new MedicalSaleResponse(
                s.getId(), s.getProductName(), s.getQuantity(),
                s.getSalePrice(), s.getCostPrice(), s.getTotalAmount(),
                round2(profit), s.getSaleDate());
    }

    private MedicalExpenseResponse toExpenseResponse(MedicalExpense e) {
        return new MedicalExpenseResponse(
                e.getId(), e.getExpenseName(), e.getExpenseType(),
                e.getAmount(), e.getDescription(), e.getExpenseDate());
    }
}
