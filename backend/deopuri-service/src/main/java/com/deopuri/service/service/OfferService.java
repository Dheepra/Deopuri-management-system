package com.deopuri.service.service;



import java.util.List;

import com.deopuri.api.dto.AssignOfferRequest;
import com.deopuri.api.dto.CreateOfferRequest;
import com.deopuri.api.dto.OfferResponse;
import com.deopuri.api.dto.TopCustomerResponse;
import com.deopuri.api.dto.UpdateOfferRequest;
import com.deopuri.api.dto.UserOfferResponse;

public interface OfferService {

    OfferResponse createOffer(CreateOfferRequest request);

    OfferResponse updateOffer(Long offerId, UpdateOfferRequest request);

    OfferResponse getOfferById(Long offerId);

    List<OfferResponse> getAllOffers();

    List<TopCustomerResponse> getTopCustomers(String period);

    void assignOffer(AssignOfferRequest request);

    List<UserOfferResponse> getUserOffers(Long userId);

}