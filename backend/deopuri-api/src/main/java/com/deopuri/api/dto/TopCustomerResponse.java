package com.deopuri.api.dto;

public record TopCustomerResponse(

        Integer rank,
        Integer userId,
        String userName,
        String shopName,
        Double totalPayment,
        Long totalOrders

) {
}