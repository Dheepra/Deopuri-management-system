package com.deopuri.api.dto;

/**
 * A medical admin's own P&amp;L. Revenue is their recorded sales; cost is the cost of goods
 * actually sold (COGS); expenses are their operating expenses. stockValue/totalPurchases are
 * informational (money currently tied up in inventory, and total ever spent buying stock).
 */
public record MedicalProfitLossResponse(
        double totalSales,
        double totalCost,       // COGS of items sold
        double totalExpense,    // operating expenses
        double grossProfit,     // totalSales - totalCost
        double grossMargin,     // % of sales
        double netProfit,       // grossProfit - totalExpense (negative = loss)
        double netMargin,       // % of sales
        String status,          // "PROFIT" or "LOSS"
        double stockValue,      // current inventory valued at cost
        double totalPurchases,  // approx total spent acquiring stock
        int salesCount,
        int itemsSold
) {
}
