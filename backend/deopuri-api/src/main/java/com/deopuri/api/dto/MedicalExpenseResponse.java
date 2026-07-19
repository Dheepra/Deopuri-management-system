package com.deopuri.api.dto;

import java.time.LocalDate;

public record MedicalExpenseResponse(
        Long id,
        String expenseName,
        String expenseType,
        Double amount,
        String description,
        LocalDate expenseDate
) {
}
