package com.deopuri.api.dto;

import jakarta.validation.constraints.NotNull;

public record AssignOfferRequest(

        @NotNull(message = "User Id is required")
        Long userId,

        @NotNull(message = "Offer Id is required")
        Long offerId

) {
}