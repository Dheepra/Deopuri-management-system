package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.BulkCartDto;
import com.deopuri.api.dto.CartDto;
import com.deopuri.api.dto.CartResponse;
import com.deopuri.api.rest.CartController;
import com.deopuri.service.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CartControllerImpl implements CartController {

    @Autowired
    private CartService cartService;

    @Override
    public ResponseEntity<List<CartResponse>> addToCart(CartDto dto) {
        return ResponseEntity.ok(cartService.addToCart(dto));
    }

    @Override
    public ResponseEntity<List<CartResponse>> addBulk(BulkCartDto dto) {
        return ResponseEntity.ok(cartService.addBulk(dto));
    }

    @Override
    public ResponseEntity<List<CartResponse>> getCart(Integer userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @Override
    public ResponseEntity<String> removeItem(Long productId) {
        return ResponseEntity.ok(cartService.removeItem(productId));
    }

    @Override
    public ResponseEntity<Map<String, String>> previewOrder() {

        LocalDateTime now = LocalDateTime.now();

        Map<String, String> response = new HashMap<>();
        response.put("day", now.getDayOfWeek().toString());
        response.put("date",
                now.format(DateTimeFormatter.ofPattern("dd MMMM yyyy")));

        return ResponseEntity.ok(response);
    }
}