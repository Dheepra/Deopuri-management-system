package com.deopuri.service.service;

import com.deopuri.api.dto.CreateExpenseRequest;
import com.deopuri.api.dto.ExpenseResponse;
import com.deopuri.api.dto.UpdateExpenseRequest;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse create(CreateExpenseRequest request);

    ExpenseResponse update(Long id, UpdateExpenseRequest request);

    ExpenseResponse getById(Long id);

    List<ExpenseResponse> getAll();

    void delete(Long id);
}