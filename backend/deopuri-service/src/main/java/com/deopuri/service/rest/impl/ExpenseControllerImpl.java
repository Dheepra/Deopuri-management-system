package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.CreateExpenseRequest;
import com.deopuri.api.dto.ExpenseResponse;
import com.deopuri.api.dto.UpdateExpenseRequest;
import com.deopuri.api.rest.ExpenseController;
import com.deopuri.service.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExpenseControllerImpl implements ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Override
    public ResponseEntity<ExpenseResponse> create(CreateExpenseRequest request) {

        return ResponseEntity.ok(expenseService.create(request));
    }

    @Override
    public ResponseEntity<List<ExpenseResponse>> findAll() {

        return ResponseEntity.ok(expenseService.getAll());
    }

    @Override
    public ResponseEntity<ExpenseResponse> findById(Long id) {

        return ResponseEntity.ok(expenseService.getById(id));
    }

    @Override
    public ResponseEntity<ExpenseResponse> update(Long id, UpdateExpenseRequest request) {

        return ResponseEntity.ok(expenseService.update(id, request));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {

        expenseService.delete(id);

        return ResponseEntity.noContent().build();
    }
}