package com.deopuri.api.rest;

import com.deopuri.api.dto.BulkCartDto;
import com.deopuri.api.dto.CartDto;
import com.deopuri.api.dto.CartResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/api/cart")
public interface CartController {

    @PostMapping("/add")
    ResponseEntity<List<CartResponse>> addToCart(
            @RequestBody CartDto dto
    );

    @PostMapping("/bulk-add")
    ResponseEntity<List<CartResponse>> addBulk(
            @RequestBody BulkCartDto dto
    );

    @GetMapping("/{userId}")
    ResponseEntity<List<CartResponse>> getCart(
            @PathVariable Integer userId
    );

    @DeleteMapping("/{productId}")
    ResponseEntity<String> removeItem(
            @PathVariable Long productId
    );

    @GetMapping("/preview")
    ResponseEntity<Map<String, String>> previewOrder();
}