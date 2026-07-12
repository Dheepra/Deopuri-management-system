package com.deopuri.api.rest;

import com.deopuri.api.dto.ProfitLossResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@RequestMapping("/deopuri/profit-loss")
public interface ProfitLossController {

    // Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD; both omitted = all-time.
    @GetMapping
    ResponseEntity<ProfitLossResponse> getProfitLoss(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to);

}