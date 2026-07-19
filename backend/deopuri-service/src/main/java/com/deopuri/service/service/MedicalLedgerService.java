package com.deopuri.service.service;

import com.deopuri.api.dto.AddStockRequest;
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
import com.deopuri.api.model.Orders;

import java.time.LocalDate;
import java.util.List;

/**
 * Per-medical-admin ledger: their own stock (from company purchases + manual entries),
 * their own sales, their own expenses, and a P&amp;L computed from those. Everything is
 * scoped to the currently-authenticated medical admin, except {@link #ingestDeliveredOrder}
 * which is an internal hook keyed off the order's owner.
 */
public interface MedicalLedgerService {

    // Stock
    MedicalStockResponse addStock(AddStockRequest request);

    List<MedicalStockResponse> listStock();

    MedicalStockResponse updateStock(Long id, UpdateStockRequest request);

    void deleteStock(Long id);

    // Sales
    MedicalSaleResponse recordSale(RecordSaleRequest request);

    List<MedicalSaleResponse> listSales();

    // Bills — a multi-item invoice. Each line becomes a sale (so it flows into P&L) and
    // draws down stock; the returned BillResponse is ready to print.
    BillResponse createBill(CreateBillRequest request);

    List<BillResponse> listBills();

    BillResponse getBill(String billNumber);

    // Khata (customer credit) — outstanding dues per customer + collecting payment.
    List<KhataCustomerResponse> listKhata();

    KhataCustomerResponse recordKhataPayment(RecordKhataPaymentRequest request);

    // Expenses
    MedicalExpenseResponse addExpense(MedicalExpenseRequest request);

    List<MedicalExpenseResponse> listExpenses();

    void deleteExpense(Long id);

    // Profit & Loss (from/to optional; both null = all-time)
    MedicalProfitLossResponse profitLoss(LocalDate from, LocalDate to);

    // Internal: called when a MEDICAL-context order is delivered — adds it to the owner's stock.
    void ingestDeliveredOrder(Orders order);
}
