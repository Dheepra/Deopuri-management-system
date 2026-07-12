package com.deopuri.service.dao;

import com.deopuri.api.model.Expense;
import com.deopuri.api.model.ExpenseType;
import com.deopuri.api.model.ReferenceType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseDao extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseType(ExpenseType expenseType);

    // The auto-created expense linked to a source row (e.g. a RawMaterial purchase).
    List<Expense> findByReferenceTypeAndReferenceId(ReferenceType referenceType, Long referenceId);
}