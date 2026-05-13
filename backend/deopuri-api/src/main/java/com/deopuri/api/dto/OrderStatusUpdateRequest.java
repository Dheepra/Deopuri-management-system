package com.deopuri.api.dto;

import com.deopuri.api.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(@NotNull(message = "Status is required") OrderStatus status) {
}
