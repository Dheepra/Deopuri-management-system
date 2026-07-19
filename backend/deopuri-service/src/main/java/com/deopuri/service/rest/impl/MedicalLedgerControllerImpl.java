package com.deopuri.service.rest.impl;

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
import com.deopuri.api.rest.MedicalLedgerController;
import com.deopuri.service.service.MedicalLedgerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class MedicalLedgerControllerImpl implements MedicalLedgerController {

    private final MedicalLedgerService service;

    public MedicalLedgerControllerImpl(MedicalLedgerService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<MedicalStockResponse> addStock(AddStockRequest request) {
        return ResponseEntity.ok(service.addStock(request));
    }

    @Override
    public ResponseEntity<List<MedicalStockResponse>> listStock() {
        return ResponseEntity.ok(service.listStock());
    }

    @Override
    public ResponseEntity<MedicalStockResponse> updateStock(Long id, UpdateStockRequest request) {
        return ResponseEntity.ok(service.updateStock(id, request));
    }

    @Override
    public ResponseEntity<Void> deleteStock(Long id) {
        service.deleteStock(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<MedicalSaleResponse> recordSale(RecordSaleRequest request) {
        return ResponseEntity.ok(service.recordSale(request));
    }

    @Override
    public ResponseEntity<List<MedicalSaleResponse>> listSales() {
        return ResponseEntity.ok(service.listSales());
    }

    @Override
    public ResponseEntity<BillResponse> createBill(CreateBillRequest request) {
        return ResponseEntity.ok(service.createBill(request));
    }

    @Override
    public ResponseEntity<List<BillResponse>> listBills() {
        return ResponseEntity.ok(service.listBills());
    }

    @Override
    public ResponseEntity<BillResponse> getBill(String billNumber) {
        return ResponseEntity.ok(service.getBill(billNumber));
    }

    @Override
    public ResponseEntity<List<KhataCustomerResponse>> listKhata() {
        return ResponseEntity.ok(service.listKhata());
    }

    @Override
    public ResponseEntity<KhataCustomerResponse> recordKhataPayment(RecordKhataPaymentRequest request) {
        return ResponseEntity.ok(service.recordKhataPayment(request));
    }

    @Override
    public ResponseEntity<MedicalExpenseResponse> addExpense(MedicalExpenseRequest request) {
        return ResponseEntity.ok(service.addExpense(request));
    }

    @Override
    public ResponseEntity<List<MedicalExpenseResponse>> listExpenses() {
        return ResponseEntity.ok(service.listExpenses());
    }

    @Override
    public ResponseEntity<Void> deleteExpense(Long id) {
        service.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<MedicalProfitLossResponse> profitLoss(LocalDate from, LocalDate to) {
        return ResponseEntity.ok(service.profitLoss(from, to));
    }
}
