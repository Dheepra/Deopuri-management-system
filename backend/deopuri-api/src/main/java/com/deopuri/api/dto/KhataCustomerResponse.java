package com.deopuri.api.dto;

import java.time.LocalDate;

// One row of the khata (credit) ledger — a customer's running dues.
public record KhataCustomerResponse(
        String customerName,
        String customerMobile,
        double totalBilled,
        double totalPaid,
        double totalDue,
        int billCount,
        LocalDate lastBillDate
) {
}
