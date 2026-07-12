package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.ProductImportResult;
import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;
import com.deopuri.api.rest.ProductController;
import com.deopuri.service.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class ProductControllerImpl implements ProductController {

    private final ProductService productService;

    public ProductControllerImpl(ProductService productService) {
        this.productService = productService;
    }

    @Override
    public ResponseEntity<ProductResponse> addProduct(
            ProductRequest request,
            MultipartFile image) {

        String imageUrl = productService.uploadImage(image);

        ProductResponse response = productService.create(request, imageUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    public ResponseEntity<ProductResponse> update(
            Long id,
            @RequestPart("data") ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = productService.uploadImage(image);
        }

        ProductResponse response = productService.update(id, request, imageUrl);

        return ResponseEntity.ok(response);
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

    @Override
    public ResponseEntity<ProductImportResult> importProducts(MultipartFile file) {
        return ResponseEntity.ok(productService.importProducts(file));
    }
}
