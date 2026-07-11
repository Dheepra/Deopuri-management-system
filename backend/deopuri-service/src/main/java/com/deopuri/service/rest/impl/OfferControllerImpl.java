package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.AssignOfferRequest;
import com.deopuri.api.dto.CreateOfferRequest;
import com.deopuri.api.dto.OfferResponse;
import com.deopuri.api.dto.TopCustomerResponse;
import com.deopuri.api.dto.UpdateOfferRequest;
import com.deopuri.api.dto.UserOfferResponse;
import com.deopuri.api.rest.OfferController;
import com.deopuri.service.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OfferControllerImpl implements OfferController {

    private final OfferService offerService;

    public OfferControllerImpl(OfferService offerService) {
        this.offerService = offerService;
    }

    @Override
    public ResponseEntity<OfferResponse> createOffer(
            @Valid CreateOfferRequest request) {

        return ResponseEntity.ok(
                offerService.createOffer(request));
    }

    @Override
    public ResponseEntity<OfferResponse> updateOffer(
            Long offerId,
            @Valid UpdateOfferRequest request) {

        return ResponseEntity.ok(
                offerService.updateOffer(offerId, request));
    }

    @Override
    public ResponseEntity<OfferResponse> getOfferById(
            Long offerId) {

        return ResponseEntity.ok(
                offerService.getOfferById(offerId));
    }

    @Override
    public ResponseEntity<List<OfferResponse>> getAllOffers() {

        return ResponseEntity.ok(
                offerService.getAllOffers());
    }

    @Override
    public ResponseEntity<List<TopCustomerResponse>> getTopCustomers(
            String period) {

        return ResponseEntity.ok(
                offerService.getTopCustomers(period));
    }

    @Override
    public ResponseEntity<String> assignOffer(
            @Valid AssignOfferRequest request) {

        offerService.assignOffer(request);

        return ResponseEntity.ok("Offer assigned successfully.");
    }

    @Override
    public ResponseEntity<List<UserOfferResponse>> getUserOffers(
            Long userId) {

        return ResponseEntity.ok(
                offerService.getUserOffers(userId));
    }
}