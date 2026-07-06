package com.deopuri.api.dto;

import java.time.LocalDateTime;

public record PaymentResponse(

        Long id,

        Double amount,

        String paymentMethod,

        String remark,

        Double balanceAfterPayment,

        LocalDateTime paymentDate

) {
}