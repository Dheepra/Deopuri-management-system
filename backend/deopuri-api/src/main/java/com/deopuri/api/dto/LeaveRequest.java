package com.deopuri.api.dto;

import com.deopuri.api.model.LeaveType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LeaveRequest(
        @NotNull LeaveType type,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fromDate,
        @NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate toDate,
        String reason) {
}
