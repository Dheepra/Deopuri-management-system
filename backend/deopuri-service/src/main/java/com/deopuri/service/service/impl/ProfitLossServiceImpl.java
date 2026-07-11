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

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProfitLossServiceImpl implements ProfitLossService {

        @Autowired
        private OrdersDao ordersDao;

        @Autowired
        private ExpenseDao expenseDao;

        @Override
        public ProfitLossResponse getProfitLoss() {

                // ================= TOTAL SALES =================

                List<Orders> deliveredOrders = ordersDao.findByStatus(OrderStatus.DELIVERED);

                Double totalSales = deliveredOrders.stream()
                                .mapToDouble(order -> order.getTotalAmount() == null ? 0.0 : order.getTotalAmount())
                                .sum();

                // ================= EXPENSES =================

                Double rawMaterialExpense = getExpenseTotal(ExpenseType.RAW_MATERIAL);

                Double manufacturingExpense = getExpenseTotal(ExpenseType.MANUFACTURING);

                Double packagingExpense = getExpenseTotal(ExpenseType.PACKAGING);

                Double deliveryExpense = getExpenseTotal(ExpenseType.DELIVERY);

                Double salaryExpense = getExpenseTotal(ExpenseType.SALARY);

                Double electricityExpense = getExpenseTotal(ExpenseType.ELECTRICITY);

                Double rentExpense = getExpenseTotal(ExpenseType.RENT);

                Double otherExpense = getExpenseTotal(ExpenseType.OTHER);

                Double totalExpense = rawMaterialExpense +
                                manufacturingExpense +
                                packagingExpense +
                                deliveryExpense +
                                salaryExpense +
                                electricityExpense +
                                rentExpense +
                                otherExpense;

                // ================= PROFIT / LOSS =================

                // ================= PROFIT / LOSS =================

                Double netProfit = totalSales - totalExpense;
                Double netLoss = 0.0;

                String status;

                if (netProfit >= 0) {
                        status = "PROFIT";
                } else {
                        status = "LOSS";
                        netLoss = Math.abs(netProfit); // Loss ko positive value me dikhao
                        netProfit = 0.0; // Profit 0 kar do
                }

                return new ProfitLossResponse(
                                totalSales,
                                rawMaterialExpense,
                                manufacturingExpense,
                                packagingExpense,
                                deliveryExpense,
                                salaryExpense,
                                electricityExpense,
                                rentExpense,
                                otherExpense,
                                totalExpense,
                                netProfit,
                                netLoss,
                                status);
        }

        // ================= HELPER =================

        private Double getExpenseTotal(ExpenseType expenseType) {

                List<Expense> expenses = expenseDao.findByExpenseType(expenseType);

                return expenses.stream()
                                .mapToDouble(expense -> expense.getAmount() == null ? 0.0 : expense.getAmount())
                                .sum();
        }

}