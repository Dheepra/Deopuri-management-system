package com.deopuri.api.dto;

public record ProfitLossResponse(

                Double totalSales,

                Double rawMaterialExpense,

                Double manufacturingExpense,

                Double packagingExpense,

                Double deliveryExpense,

                Double salaryExpense,

                Double electricityExpense,

                Double rentExpense,

                Double otherExpense,

                Double totalExpense,

                Double netProfit,

                Double netloss,

                String status

) {
}