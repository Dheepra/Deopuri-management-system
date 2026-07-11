package com.deopuri.api.dto;

import java.time.LocalDate;

import com.deopuri.api.model.OfferType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateOfferRequest(

        @NotBlank(message = "Offer name is required")
        String offerName,

        String description,

        @NotNull(message = "Discount value is required")
        Double discountValue,

        @NotNull(message = "Offer type is required")
        OfferType offerType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        Boolean active

) {
}