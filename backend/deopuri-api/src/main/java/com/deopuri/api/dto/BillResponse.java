package com.deopuri.api.dto;

import java.time.LocalDate;
import java.util.List;

// A full bill/invoice, ready to render or print.
public record BillResponse(
        String billNumber,
        String sellerShopName,   // the medical shop's name (from the admin's profile)
        String customerName,
        String customerMobile,
        LocalDate billDate,
        Double totalAmount,
        Double paidAmount,
        Double dueAmount,
        Double totalProfit,
        int itemCount,
        List<BillItemResponse> items
) {
}
