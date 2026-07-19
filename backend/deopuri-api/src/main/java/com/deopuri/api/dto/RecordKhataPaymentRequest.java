package com.deopuri.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// Collect a lump sum from a customer; it is applied to their oldest unpaid bills first.
// Identify the customer by mobile if present, otherwise by name.
public record RecordKhataPaymentRequest(
        String customerName,
        String customerMobile,
        @NotNull @Positive Double amount
) {
}
