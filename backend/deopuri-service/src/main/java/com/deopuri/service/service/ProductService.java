package com.deopuri.service.service;

import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductRequest request);

    List<ProductResponse> findAll();

    ProductResponse findById(Long id);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    ProductVariantResponse addVariant(Long productId, ProductVariantRequest request);
}
