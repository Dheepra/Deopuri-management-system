package com.deopuri.api.dto;

/**
 * One staff member's attendance status for a specific day.
 * status = "PRESENT" (marked) | "LEAVE" (approved leave covers the day) | "ABSENT" (neither).
 */
public record StaffAttendanceRow(
        Long staffId,
        String name,
        String department,
        String status) {
}
