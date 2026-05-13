package com.deopuri.service.service.impl;

import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantResponse;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;

final class ProductMapper {

    private ProductMapper() {
    }

    static ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getQuantity(),
                p.getManufacturingDate(),
                p.getImageUrl());
    }

    static ProductVariantResponse toResponse(ProductVariant v) {
        return new ProductVariantResponse(
                v.getId(),
                v.getSize(),
                v.getStock(),
                v.getProduct() == null ? null : v.getProduct().getId());
    }
}
