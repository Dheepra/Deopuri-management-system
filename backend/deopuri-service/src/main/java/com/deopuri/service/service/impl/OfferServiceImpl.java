package com.deopuri.service.service.impl;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.deopuri.api.dto.AssignOfferRequest;
import com.deopuri.api.dto.CreateOfferRequest;
import com.deopuri.api.dto.OfferResponse;
import com.deopuri.api.dto.UpdateOfferRequest;
import com.deopuri.api.dto.UserOfferResponse;
import com.deopuri.api.model.Offer;
import com.deopuri.api.model.UserOffer;
import com.deopuri.api.model.Users;
import com.deopuri.service.service.OfferService;
import com.deopuri.service.dao.OfferDao;
import com.deopuri.service.dao.OrdersDao;
import com.deopuri.service.dao.UserOfferDao;
import com.deopuri.service.dao.UsersDao;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.domain.PageRequest;

import com.deopuri.api.dto.TopCustomerResponse;

@Service
public class OfferServiceImpl implements OfferService {

    private final OfferDao offerDao;
    private final OrdersDao ordersDao;
    private final UserOfferDao userOfferDao;
    private final UsersDao usersDao;

    public OfferServiceImpl(
            OfferDao offerDao,
            OrdersDao ordersDao,
            UserOfferDao userOfferDao,
            UsersDao usersDao) {

        this.offerDao = offerDao;
        this.ordersDao = ordersDao;
        this.userOfferDao = userOfferDao;
        this.usersDao = usersDao;
    }

    @Override
    public OfferResponse createOffer(CreateOfferRequest request) {

        Offer offer = new Offer();

        offer.setOfferName(request.offerName());
        offer.setDescription(request.description());
        offer.setDiscountValue(request.discountValue());
        offer.setOfferType(request.offerType());
        offer.setStartDate(request.startDate());
        offer.setEndDate(request.endDate());
        offer.setActive(request.active());

        Offer savedOffer = offerDao.save(offer);

        return mapToResponse(savedOffer);
    }

    @Override
    public OfferResponse updateOffer(Long offerId, UpdateOfferRequest request) {

        Offer offer = offerDao.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        offer.setOfferName(request.offerName());
        offer.setDescription(request.description());
        offer.setDiscountValue(request.discountValue());
        offer.setOfferType(request.offerType());
        offer.setStartDate(request.startDate());
        offer.setEndDate(request.endDate());
        offer.setActive(request.active());

        Offer updatedOffer = offerDao.save(offer);

        return mapToResponse(updatedOffer);
    }

    private OfferResponse mapToResponse(Offer offer) {

        return new OfferResponse(
                offer.getId(),
                offer.getOfferName(),
                offer.getDescription(),
                offer.getDiscountValue(),
                offer.getOfferType(),
                offer.getStartDate(),
                offer.getEndDate(),
                offer.getActive(),
                offer.getCreatedDate());
    }

    @Override
    public OfferResponse getOfferById(Long offerId) {

        Offer offer = offerDao.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        return mapToResponse(offer);
    }

    @Override
    public List<OfferResponse> getAllOffers() {

        return offerDao.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopCustomerResponse> getTopCustomers(String period) {

        LocalDateTime fromDate = LocalDateTime.now();

        switch (period.toUpperCase()) {

            case "1M":
                fromDate = fromDate.minusMonths(1);
                break;

            case "3M":
                fromDate = fromDate.minusMonths(3);
                break;

            case "6M":
                fromDate = fromDate.minusMonths(6);
                break;

            case "9M":
                fromDate = fromDate.minusMonths(9);
                break;

            case "1Y":
                fromDate = fromDate.minusYears(1);
                break;

            default:
                throw new RuntimeException("Invalid Period");
        }

        List<TopCustomerResponse> customers = ordersDao.findTopCustomers(
                fromDate,
                PageRequest.of(0, 3));

        for (int i = 0; i < customers.size(); i++) {

            TopCustomerResponse c = customers.get(i);

            customers.set(i,
                    new TopCustomerResponse(

                            i + 1,

                            c.userId(),

                            c.userName(),

                            c.shopName(),

                            c.totalPayment(),

                            c.totalOrders()

                    ));
        }

        return customers;

    }

    @Override
    public void assignOffer(AssignOfferRequest request) {

        Offer offer = offerDao.findById(request.offerId())
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        Users user = usersDao.findById(request.userId().intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserOffer userOffer = new UserOffer();

        userOffer.setOffer(offer);
        userOffer.setUser(user);
        userOffer.setClaimed(false);
        userOffer.setExpired(false);

        userOfferDao.save(userOffer);
    }

    @Transactional(readOnly = true)
    @Override
    public List<UserOfferResponse> getUserOffers(Long userId) {

        return userOfferDao.findByUserId(userId)
                .stream()
                .map(userOffer -> new UserOfferResponse(

                        userOffer.getId(),

                        (long) userOffer.getUser().getId(),

                        userOffer.getUser().getFirstName()
                                + " "
                                + userOffer.getUser().getLastName(),

                        userOffer.getUser().getShopName(),

                        userOffer.getOffer().getId(),

                        userOffer.getOffer().getOfferName(),

                        userOffer.getOffer().getDiscountValue(),

                        userOffer.getOffer().getOfferType(),

                        userOffer.getAssignedDate(),

                        userOffer.getClaimed(),

                        userOffer.getExpired()

                ))
                .collect(Collectors.toList());

    }
}