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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RequestMapping("/api/products")
public interface ProductController {

    @PostMapping(consumes = "multipart/form-data")
ResponseEntity<ProductResponse> addProduct(
        @Valid @RequestPart("data") ProductRequest request,
        @RequestPart("image") MultipartFile image
);

    @GetMapping
    ResponseEntity<List<ProductResponse>> findAll();

    @GetMapping("/{id}")
    ResponseEntity<ProductResponse> findById(@PathVariable Long id);

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
ResponseEntity<ProductResponse> update(
        @PathVariable Long id,
        @Valid @RequestPart("data") ProductRequest request,
        @RequestPart(value = "image", required = false) MultipartFile image
);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id);

    @PostMapping("/{productId}/variants")
    ResponseEntity<ProductVariantResponse> addVariant(@PathVariable Long productId,
                                                     @Valid @RequestBody ProductVariantRequest request);
}
