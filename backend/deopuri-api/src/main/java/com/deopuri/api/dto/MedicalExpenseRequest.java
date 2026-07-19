package com.deopuri.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record MedicalExpenseRequest(
        @NotBlank String expenseName,
        String expenseType,
        @NotNull @PositiveOrZero Double amount,
        String description,
        LocalDate expenseDate
) {
}
