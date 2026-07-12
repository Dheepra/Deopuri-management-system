package com.deopuri.api.rest;

import com.deopuri.api.dto.AssignOfferRequest;
import com.deopuri.api.dto.CreateOfferRequest;
import com.deopuri.api.dto.OfferResponse;
import com.deopuri.api.dto.TopCustomerResponse;
import com.deopuri.api.dto.UpdateOfferRequest;
import com.deopuri.api.dto.UserOfferResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/deopuri/offers")
public interface OfferController {

    @PostMapping
    ResponseEntity<OfferResponse> createOffer(
            @Valid @RequestBody CreateOfferRequest request);

    @PutMapping("/{offerId}")
    ResponseEntity<OfferResponse> updateOffer(
            @PathVariable Long offerId,
            @Valid @RequestBody UpdateOfferRequest request);

    @GetMapping("/{offerId}")
    ResponseEntity<OfferResponse> getOfferById(
            @PathVariable Long offerId);

    @GetMapping
    ResponseEntity<List<OfferResponse>> getAllOffers();

    @GetMapping("/top-customers")
    ResponseEntity<List<TopCustomerResponse>> getTopCustomers(
            @RequestParam String period);

    @PostMapping("/assign")
    ResponseEntity<String> assignOffer(
            @Valid @RequestBody AssignOfferRequest request);

    @GetMapping("/user/{userId}")
    ResponseEntity<List<UserOfferResponse>> getUserOffers(
            @PathVariable Long userId);
}