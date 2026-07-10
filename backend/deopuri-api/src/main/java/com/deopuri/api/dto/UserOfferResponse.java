package com.deopuri.api.dto;

import java.time.LocalDate;
import com.deopuri.api.model.OfferType;

public record UserOfferResponse(

        Long id,
        Long userId,
        String userName,
        String shopName,
        Long offerId,
        String offerName,
        Double discountValue,
        OfferType offerType,
        LocalDate assignedDate,
        Boolean claimed,
        Boolean expired

) {
}