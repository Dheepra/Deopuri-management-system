package com.deopuri.api.dto;

import java.time.LocalDate;

public record ProductResponse(
        Long id,
        String name,
        String description,
        Double price,
        Integer quantity,
        LocalDate manufacturingDate,
        String imageUrl) {
}
