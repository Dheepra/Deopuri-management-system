package com.deopuri.service.service;

import com.deopuri.api.dto.ProductImportResult;
import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ProductResponse create(ProductRequest request, String imageUrl);

    List<ProductResponse> findAll();

    ProductResponse findById(Long id);

    ProductResponse update(Long id, ProductRequest request, String imageUrl);

    void delete(Long id);

    String uploadImage(MultipartFile image);

    ProductVariantResponse addVariant(Long productId, ProductVariantRequest request);

    ProductImportResult importProducts(MultipartFile file);
}
