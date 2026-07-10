package com.deopuri.service.dao;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.deopuri.api.model.UserOffer;

public interface UserOfferDao extends JpaRepository<UserOffer, Long> {


     @Query("""
        SELECT uo
        FROM UserOffer uo
        JOIN FETCH uo.user
        JOIN FETCH uo.offer
        WHERE uo.user.id = :userId
    """)
    List<UserOffer> findByUserId(@Param("userId") Long userId);


}