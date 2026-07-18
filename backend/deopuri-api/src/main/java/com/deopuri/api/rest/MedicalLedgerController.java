package com.deopuri.api.rest;

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

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

// All endpoints are scoped to the authenticated medical admin (server derives the owner from the JWT).
@RequestMapping("/deopuri/medical")
public interface MedicalLedgerController {

    // Stock
    @PostMapping("/stock")
    ResponseEntity<MedicalStockResponse> addStock(@Valid @RequestBody AddStockRequest request);

    @GetMapping("/stock")
    ResponseEntity<List<MedicalStockResponse>> listStock();

    @PutMapping("/stock/{id}")
    ResponseEntity<MedicalStockResponse> updateStock(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateStockRequest request);

    @DeleteMapping("/stock/{id}")
    ResponseEntity<Void> deleteStock(@PathVariable Long id);

    // Sales
    @PostMapping("/sales")
    ResponseEntity<MedicalSaleResponse> recordSale(@Valid @RequestBody RecordSaleRequest request);

    @GetMapping("/sales")
    ResponseEntity<List<MedicalSaleResponse>> listSales();

    // Bills / invoices
    @PostMapping("/bills")
    ResponseEntity<BillResponse> createBill(@Valid @RequestBody CreateBillRequest request);

    @GetMapping("/bills")
    ResponseEntity<List<BillResponse>> listBills();

    @GetMapping("/bills/{billNumber}")
    ResponseEntity<BillResponse> getBill(@PathVariable String billNumber);

    // Khata (customer credit / udhaar)
    @GetMapping("/khata")
    ResponseEntity<List<KhataCustomerResponse>> listKhata();

    @PostMapping("/khata/pay")
    ResponseEntity<KhataCustomerResponse> recordKhataPayment(@Valid @RequestBody RecordKhataPaymentRequest request);

    // Expenses
    @PostMapping("/expenses")
    ResponseEntity<MedicalExpenseResponse> addExpense(@Valid @RequestBody MedicalExpenseRequest request);

    @GetMapping("/expenses")
    ResponseEntity<List<MedicalExpenseResponse>> listExpenses();

    @DeleteMapping("/expenses/{id}")
    ResponseEntity<Void> deleteExpense(@PathVariable Long id);

    // Profit & Loss (from/to optional ISO dates)
    @GetMapping("/profit-loss")
    ResponseEntity<MedicalProfitLossResponse> profitLoss(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to);
}
