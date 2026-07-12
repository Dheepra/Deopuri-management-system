package com.deopuri.service.service.impl;

import com.deopuri.api.dto.ProfitLossResponse;
import com.deopuri.api.model.Expense;
import com.deopuri.api.model.ExpenseType;
import com.deopuri.api.model.OrderStatus;
import com.deopuri.api.model.Orders;
import com.deopuri.service.dao.ExpenseDao;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.service.ProfitLossService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProfitLossServiceImpl implements ProfitLossService {

        private static final int MONEY_SCALE = 2;

        @Autowired
        private OrdersDao ordersDao;

        @Autowired
        private ExpenseDao expenseDao;

        @Override
        public ProfitLossResponse getProfitLoss(LocalDate from, LocalDate to) {

                // ================= TOTAL SALES (delivered orders in period) =================
                BigDecimal totalSales = ordersDao.findByStatus(OrderStatus.DELIVERED).stream()
                                .filter(o -> inRange(o.getOrderDate() == null ? null
                                                : o.getOrderDate().toLocalDate(), from, to))
                                .map(Orders::getTotalAmount)
                                .filter(a -> a != null)
                                .map(BigDecimal::valueOf)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // ================= EXPENSES (by type, in period) =================
                BigDecimal rawMaterial = expenseTotal(ExpenseType.RAW_MATERIAL, from, to);
                BigDecimal manufacturing = expenseTotal(ExpenseType.MANUFACTURING, from, to);
                BigDecimal packaging = expenseTotal(ExpenseType.PACKAGING, from, to);
                BigDecimal delivery = expenseTotal(ExpenseType.DELIVERY, from, to);
                BigDecimal salary = expenseTotal(ExpenseType.SALARY, from, to);
                BigDecimal electricity = expenseTotal(ExpenseType.ELECTRICITY, from, to);
                BigDecimal rent = expenseTotal(ExpenseType.RENT, from, to);
                BigDecimal other = expenseTotal(ExpenseType.OTHER, from, to);

                // COGS = cost of goods sold; the rest are operating expenses.
                BigDecimal cogs = rawMaterial.add(manufacturing).add(packaging);
                BigDecimal operating = salary.add(electricity).add(rent).add(delivery).add(other);
                BigDecimal totalExpense = cogs.add(operating);

                // ================= RESULTS =================
                BigDecimal grossProfit = totalSales.subtract(cogs);
                BigDecimal net = totalSales.subtract(totalExpense); // signed

                String status = net.signum() >= 0 ? "PROFIT" : "LOSS";
                BigDecimal netProfit = net.signum() >= 0 ? net : BigDecimal.ZERO;
                BigDecimal netLoss = net.signum() < 0 ? net.abs() : BigDecimal.ZERO;

                BigDecimal grossMargin = percentOf(grossProfit, totalSales);
                BigDecimal netMargin = percentOf(net, totalSales);

                return new ProfitLossResponse(
                                money(totalSales),
                                money(rawMaterial), money(manufacturing), money(packaging), money(delivery),
                                money(salary), money(electricity), money(rent), money(other),
                                money(cogs), money(operating), money(totalExpense),
                                money(grossProfit), money(netProfit), money(netLoss),
                                grossMargin, netMargin,
                                status, from, to);
        }

        // Sum of a category's expenses whose expenseDate falls in [from, to] (null bounds = open).
        private BigDecimal expenseTotal(ExpenseType type, LocalDate from, LocalDate to) {
                List<Expense> expenses = expenseDao.findByExpenseType(type);
                return expenses.stream()
                                .filter(e -> inRange(e.getExpenseDate(), from, to))
                                .map(Expense::getAmount)
                                .filter(a -> a != null)
                                .map(BigDecimal::valueOf)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        private boolean inRange(LocalDate date, LocalDate from, LocalDate to) {
                if (from == null && to == null) {
                        return true; // all-time
                }
                if (date == null) {
                        return false; // can't place an undated row in a bounded period
                }
                if (from != null && date.isBefore(from)) {
                        return false;
                }
                return to == null || !date.isAfter(to);
        }

        private BigDecimal money(BigDecimal v) {
                return v.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        }

        private BigDecimal percentOf(BigDecimal part, BigDecimal whole) {
                if (whole == null || whole.signum() == 0) {
                        return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
                }
                return part.multiply(BigDecimal.valueOf(100))
                                .divide(whole, 1, RoundingMode.HALF_UP);
        }
}
