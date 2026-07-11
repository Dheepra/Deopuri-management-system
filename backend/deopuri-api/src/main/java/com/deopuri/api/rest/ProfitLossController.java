package com.deopuri.api.rest;

import com.deopuri.api.dto.ProfitLossResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/profit-loss")
public interface ProfitLossController {

    @GetMapping
    ResponseEntity<ProfitLossResponse> getProfitLoss();

}