package com.deopuri.service.service.impl;

import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.service.dao.ProductRepository;
import com.deopuri.service.dao.ProductVariantDao;
import com.deopuri.service.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final ProductVariantDao variantDao;

    public ProductServiceImpl(ProductRepository productRepository, ProductVariantDao variantDao) {
        this.productRepository = productRepository;
        this.variantDao = variantDao;
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        product.setManufacturingDate(request.manufacturingDate());
        product.setImageUrl(request.imageUrl());

        Product saved = productRepository.save(product);
        log.info("Product created id={}", saved.getId());
        return ProductMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(ProductMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductMapper.toResponse(loadProduct(id));
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = loadProduct(id);

        if (request.name() != null) product.setName(request.name());
        if (request.description() != null) product.setDescription(request.description());
        if (request.price() != null) product.setPrice(request.price());
        if (request.quantity() != null) product.setQuantity(request.quantity());
        if (request.manufacturingDate() != null) product.setManufacturingDate(request.manufacturingDate());
        if (request.imageUrl() != null) product.setImageUrl(request.imageUrl());

        log.info("Product updated id={}", id);
        return ProductMapper.toResponse(product);
    }

    @Override
    public void delete(Long id) {
        Product product = loadProduct(id);
        productRepository.delete(product);
        log.info("Product deleted id={}", id);
    }

    @Override
    public ProductVariantResponse addVariant(Long productId, ProductVariantRequest request) {
        Product product = loadProduct(productId);

        ProductVariant variant = new ProductVariant();
        variant.setSize(request.size());
        variant.setStock(request.stock());
        variant.setProduct(product);

        ProductVariant saved = variantDao.save(variant);
        log.info("Variant created id={} productId={}", saved.getId(), productId);
        return ProductMapper.toResponse(saved);
    }

    private Product loadProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }
}
