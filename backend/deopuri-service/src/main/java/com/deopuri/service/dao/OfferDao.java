package com.deopuri.service.dao;


import org.springframework.data.jpa.repository.JpaRepository;

import com.deopuri.api.model.Offer;

public interface OfferDao extends JpaRepository<Offer, Long> {

}