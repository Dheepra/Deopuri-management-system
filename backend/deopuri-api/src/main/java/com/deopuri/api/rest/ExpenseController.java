package com.deopuri.api.rest;

import com.deopuri.api.dto.CreateExpenseRequest;
import com.deopuri.api.dto.ExpenseResponse;
import com.deopuri.api.dto.UpdateExpenseRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/deopuri/expenses")
public interface ExpenseController {

    @PostMapping
    ResponseEntity<ExpenseResponse> create(
            @Valid @RequestBody CreateExpenseRequest request
    );

    @GetMapping
    ResponseEntity<List<ExpenseResponse>> findAll();

    @GetMapping("/{id}")
    ResponseEntity<ExpenseResponse> findById(
            @PathVariable Long id
    );

    @PutMapping("/{id}")
    ResponseEntity<ExpenseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExpenseRequest request
    );

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @PathVariable Long id
    );
}