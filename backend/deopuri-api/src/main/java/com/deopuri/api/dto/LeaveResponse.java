package com.deopuri.api.dto;

public record LeaveResponse(
        Long id,
        String type,
        String fromDate,
        String toDate,
        int days,
        String reason,
        String status,
        String staffName,
        String appliedAt) {
}
