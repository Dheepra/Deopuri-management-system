package com.deopuri.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitLossResponse(

                BigDecimal totalSales,

                // Per-category expenses
                BigDecimal rawMaterialExpense,
                BigDecimal manufacturingExpense,
                BigDecimal packagingExpense,
                BigDecimal deliveryExpense,
                BigDecimal salaryExpense,
                BigDecimal electricityExpense,
                BigDecimal rentExpense,
                BigDecimal otherExpense,

                // Grouped
                BigDecimal cogs,             // cost of goods sold = raw material + manufacturing + packaging
                BigDecimal operatingExpense, // salary + electricity + rent + delivery + other
                BigDecimal totalExpense,     // cogs + operatingExpense

                // Results
                BigDecimal grossProfit,      // totalSales - cogs (can be negative = gross loss)
                BigDecimal netProfit,        // shown when status = PROFIT (else 0)
                BigDecimal netLoss,          // shown when status = LOSS  (positive; else 0)
                BigDecimal grossMargin,      // grossProfit / totalSales * 100
                BigDecimal netMargin,        // signed net / totalSales * 100

                String status,               // PROFIT | LOSS

                // Period (null = all-time)
                LocalDate fromDate,
                LocalDate toDate

) {
}
