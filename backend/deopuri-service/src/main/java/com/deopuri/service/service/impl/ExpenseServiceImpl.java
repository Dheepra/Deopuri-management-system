package com.deopuri.service.service.impl;

import com.deopuri.api.dto.CreateExpenseRequest;
import com.deopuri.api.dto.ExpenseResponse;
import com.deopuri.api.dto.UpdateExpenseRequest;
import com.deopuri.api.model.Expense;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.service.dao.ExpenseDao;
import com.deopuri.service.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseDao expenseDao;

    // ================= CREATE =================

    @Override
    public ExpenseResponse create(CreateExpenseRequest request) {

        Expense expense = new Expense();

        expense.setExpenseName(request.expenseName());
        expense.setExpenseType(request.expenseType());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setExpenseDate(request.expenseDate());
        expense.setReferenceId(request.referenceId());
        expense.setReferenceType(request.referenceType());

        expenseDao.save(expense);

        return toResponse(expense);
    }

    // ================= UPDATE =================

    @Override
    public ExpenseResponse update(Long id, UpdateExpenseRequest request) {

        Expense expense = expenseDao.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found with id " + id));

        expense.setExpenseName(request.expenseName());
        expense.setExpenseType(request.expenseType());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setExpenseDate(request.expenseDate());
        expense.setReferenceId(request.referenceId());
        expense.setReferenceType(request.referenceType());

        expenseDao.save(expense);

        return toResponse(expense);
    }

    // ================= GET BY ID =================

    @Override
    public ExpenseResponse getById(Long id) {

        Expense expense = expenseDao.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found with id " + id));

        return toResponse(expense);
    }

    // ================= GET ALL =================

    @Override
    public List<ExpenseResponse> getAll() {

        return expenseDao.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ================= DELETE =================

    @Override
    public void delete(Long id) {

        Expense expense = expenseDao.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Expense not found with id " + id));

        expenseDao.delete(expense);
    }

    // ================= RESPONSE =================

    private ExpenseResponse toResponse(Expense expense) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getExpenseName(),
                expense.getExpenseType(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getReferenceId(),
                expense.getReferenceType()
        );
    }
}