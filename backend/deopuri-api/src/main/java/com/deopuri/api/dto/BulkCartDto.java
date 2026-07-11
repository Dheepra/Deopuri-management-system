package com.deopuri.api.dto;

import java.util.List;

public record BulkCartDto(
        Integer userId,
        List<CartItemRequest> items
) {}