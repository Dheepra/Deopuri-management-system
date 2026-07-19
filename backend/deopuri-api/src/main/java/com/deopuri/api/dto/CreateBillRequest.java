package com.deopuri.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

// A customer bill = optional customer details + one or more medicine lines.
public record CreateBillRequest(
        String customerName,
        String customerMobile,
        LocalDate billDate,
        // How much the customer paid now. null = fully paid (no udhaar); less than total = credit.
        Double paidAmount,
        @NotEmpty @Valid List<BillItemRequest> items
) {
}
