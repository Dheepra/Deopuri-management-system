package com.deopuri.api.dto;

import com.deopuri.api.model.ExpenseType;
import com.deopuri.api.model.ReferenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateExpenseRequest(

        @NotBlank(message = "Expense name is required")
        String expenseName,

        @NotNull(message = "Expense type is required")
        ExpenseType expenseType,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        Double amount,

        String description,

        @NotNull(message = "Expense date is required")
        LocalDate expenseDate,

        Long referenceId,

        ReferenceType referenceType

) {
}