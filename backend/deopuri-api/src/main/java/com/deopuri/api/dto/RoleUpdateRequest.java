package com.deopuri.api.dto;

import com.deopuri.api.model.UserRole;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(@NotNull(message = "Role is required") UserRole role) {
}
