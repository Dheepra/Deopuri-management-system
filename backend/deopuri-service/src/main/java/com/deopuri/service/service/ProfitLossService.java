package com.deopuri.service.service;

import com.deopuri.api.dto.ProfitLossResponse;

import java.time.LocalDate;

public interface ProfitLossService {

    // from/to are optional (null = all-time).
    ProfitLossResponse getProfitLoss(LocalDate from, LocalDate to);

}