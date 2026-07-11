package com.deopuri.api.dto;

import java.time.LocalDate;

public record RawMaterialResponse(

        Long id,

        String name,

        String category,

        Double quantity,

        String unit,

        Double unitPrice,

        String supplierName,

        String description,

        LocalDate purchaseDate

) {
}