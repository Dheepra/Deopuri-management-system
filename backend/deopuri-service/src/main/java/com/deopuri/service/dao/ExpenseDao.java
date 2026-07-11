package com.deopuri.service.dao;

import com.deopuri.api.model.Expense;
import com.deopuri.api.model.ExpenseType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseDao extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseType(ExpenseType expenseType);
}