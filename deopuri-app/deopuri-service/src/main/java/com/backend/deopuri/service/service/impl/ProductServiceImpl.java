package com.backend.deopuri.service.service.impl;

import com.backend.deopuri.api.model.Product;
import com.backend.deopuri.service.dao.ProductRepository;
import com.backend.deopuri.service.service.ProductService;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public Product create(Product product) {

        log.info("========== PRODUCT SAVE START ==========");
        log.info("PRODUCT NAME : {}", product.getName());
        log.info("PRODUCT PRICE : {}", product.getPrice());

        Product savedProduct = productRepository.save(product);

        log.info("PRODUCT SAVED SUCCESSFULLY");
        log.info("PRODUCT ID : {}", savedProduct.getId());

        log.info("=========== PRODUCT SAVE END ===========");

        return savedProduct;
    }

     @Override
    public List<Product> findAll() {

        log.info("SERVICE: GET ALL PRODUCTS START");

        List<Product> list = productRepository.findAll();

        log.info("TOTAL PRODUCTS FOUND: {}", list.size());

        return list;
    }

    // ================= GET PRODUCT BY ID =================
    @Override
    public Product findById(Long id) {

        log.info("SERVICE: GET PRODUCT BY ID START");
        log.info("REQUEST PRODUCT ID: {}", id);

        return productRepository.findById(id)
                .map(product -> {
                    log.info("PRODUCT FOUND SUCCESSFULLY");
                    log.info("PRODUCT NAME: {}", product.getName());
                    return product;
                })
                .orElseGet(() -> {
                    log.warn("PRODUCT NOT FOUND WITH ID: {}", id);
                    return null;
                });
    }
  @Override
public Product update(Long id, Product product) {

    log.info("========== UPDATE PRODUCT START ==========");
    log.info("PRODUCT ID : {}", id);

    Optional<Product> optional = productRepository.findById(id);

    if (optional.isEmpty()) {

        log.warn("PRODUCT NOT FOUND WITH ID : {}", id);

        throw new RuntimeException("Product not found");
    }

    Product oldProduct = optional.get();

    if (product.getName() != null) {

        log.info("UPDATING NAME");

        oldProduct.setName(product.getName());
    }

    if (product.getDescription() != null) {

        log.info("UPDATING DESCRIPTION");

        oldProduct.setDescription(product.getDescription());
    }

    if (product.getPrice() != null) {

        log.info("UPDATING PRICE");

        oldProduct.setPrice(product.getPrice());
    }

    if (product.getQuantity() != null) {

        log.info("UPDATING QUANTITY");

        oldProduct.setQuantity(product.getQuantity());
    }

    if (product.getImageUrl() != null) {

        log.info("UPDATING IMAGE URL");

        oldProduct.setImageUrl(product.getImageUrl());
    }

    if (product.getManufacturingDate() != null) {

        log.info("UPDATING MANUFACTURING DATE");

        oldProduct.setManufacturingDate(product.getManufacturingDate());
    }

    Product updatedProduct = productRepository.save(oldProduct);

    log.info("PRODUCT UPDATED SUCCESSFULLY");
    log.info("========== UPDATE PRODUCT END ==========");

    return updatedProduct;
}

    @Override
    public void delete(Long id) {

        log.info("========== DELETE PRODUCT START ==========");
        log.info("DELETE PRODUCT ID : {}", id);

        productRepository.deleteById(id);

        log.info("PRODUCT DELETED SUCCESSFULLY");

        log.info("=========== DELETE PRODUCT END ===========");
    }
}