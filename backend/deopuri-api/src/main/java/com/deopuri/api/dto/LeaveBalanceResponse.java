package com.deopuri.api.dto;

public record LeaveBalanceResponse(
        int casualTotal,
        int casualUsed,
        int casualRemaining,
        int sickUsed,
        int unpaidUsed) {
}
