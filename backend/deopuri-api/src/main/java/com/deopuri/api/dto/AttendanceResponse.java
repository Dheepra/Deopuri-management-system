package com.deopuri.api.dto;

public record AttendanceResponse(
        String date,
        String status,
        String markedAt) {
}
