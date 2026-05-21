package com.deopuri.service.service;

import com.deopuri.api.dto.BulkCartDto;
import com.deopuri.api.dto.CartDto;
import com.deopuri.api.dto.CartResponse;

import java.util.List;

public interface CartService {

    List<CartResponse> addToCart(CartDto dto);

    List<CartResponse> getCart(Integer userId);

    String removeItem(Long productId);

    List<CartResponse> addBulk(BulkCartDto dto);

}