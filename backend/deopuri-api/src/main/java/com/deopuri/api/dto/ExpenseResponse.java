package com.deopuri.api.dto;

import com.deopuri.api.model.ExpenseType;
import com.deopuri.api.model.ReferenceType;

import java.time.LocalDate;

public record ExpenseResponse(

        Long id,

        String expenseName,

        ExpenseType expenseType,

        Double amount,

        String description,

        LocalDate expenseDate,

        Long referenceId,

        ReferenceType referenceType

) {
}