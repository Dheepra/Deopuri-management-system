package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;
import com.deopuri.api.rest.ProductController;
import com.deopuri.service.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProductControllerImpl implements ProductController {

    private final ProductService productService;

    public ProductControllerImpl(ProductService productService) {
        this.productService = productService;
    }

    @Override
    public ResponseEntity<ProductResponse> addProduct(ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @Override
    public ResponseEntity<List<ProductResponse>> findAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @Override
    public ResponseEntity<ProductResponse> findById(Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @Override
    public ResponseEntity<ProductResponse> update(Long id, ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ProductVariantResponse> addVariant(Long productId, ProductVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.addVariant(productId, request));
    }
}
