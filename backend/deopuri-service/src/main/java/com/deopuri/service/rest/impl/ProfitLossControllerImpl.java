package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.ProfitLossResponse;
import com.deopuri.api.rest.ProfitLossController;
import com.deopuri.service.service.ProfitLossService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
public class ProfitLossControllerImpl implements ProfitLossController {

    @Autowired
    private ProfitLossService profitLossService;

    @Override
    public ResponseEntity<ProfitLossResponse> getProfitLoss(LocalDate from, LocalDate to) {

        return ResponseEntity.ok(profitLossService.getProfitLoss(from, to));
    }
}