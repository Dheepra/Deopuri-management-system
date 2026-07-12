package com.deopuri.api.dto;

public record StaffDashboardResponse(
        boolean todayMarked,
        int presentThisMonth,
        int casualRemaining,
        int pendingLeaves) {
}
