package com.deopuri.api.dto;

import java.time.LocalDate;

import com.deopuri.api.model.OfferType;


public record OfferResponse(

        Long id,
        String offerName,
        String description,
        Double discountValue,
        OfferType offerType,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active,
        LocalDate createdDate

) {
}