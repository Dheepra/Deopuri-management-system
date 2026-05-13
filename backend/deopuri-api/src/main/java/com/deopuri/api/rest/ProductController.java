package com.deopuri.api.rest;

import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RequestMapping("/api/products")
public interface ProductController {

    @PostMapping
    ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody ProductRequest request);

    @GetMapping
    ResponseEntity<List<ProductResponse>> findAll();

    @GetMapping("/{id}")
    ResponseEntity<ProductResponse> findById(@PathVariable Long id);

    @PutMapping("/{id}")
    ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                           @Valid @RequestBody ProductRequest request);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id);

    @PostMapping("/{productId}/variants")
    ResponseEntity<ProductVariantResponse> addVariant(@PathVariable Long productId,
                                                     @Valid @RequestBody ProductVariantRequest request);
}
