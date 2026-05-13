package com.backend.deopuri.service.rest.impl;

import com.backend.deopuri.api.model.Product;
import com.backend.deopuri.api.rest.ProductController;
import com.backend.deopuri.service.service.ProductService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductControllerImpl implements ProductController {

    private static final Logger log =
            LoggerFactory.getLogger(ProductControllerImpl.class);

    private final ProductService productService;

    public ProductControllerImpl(ProductService productService) {
        this.productService = productService;
    }

    @Override
    public ResponseEntity<Product> addProduct(Product product) {

        log.info("========== ADD PRODUCT API HIT ==========");
        log.info("REQUEST BODY : {}", product);

        Product savedProduct = productService.create(product);

        log.info("PRODUCT SAVED SUCCESSFULLY");
        log.info("PRODUCT ID : {}", savedProduct.getId());

        return new ResponseEntity<>(
                savedProduct,
                HttpStatus.CREATED
        );
    }

    @Override
    public ResponseEntity<List<Product>> findAll() {

        log.info("========== GET ALL PRODUCTS API HIT ==========");

        List<Product> products = productService.findAll();

        log.info("TOTAL PRODUCTS : {}", products.size());

        return ResponseEntity.ok(products);
    }

    @Override
public ResponseEntity<Product> findById(Long id) {

    log.info("========== GET PRODUCT BY ID API HIT ==========");
    log.info("REQUEST ID : {}", id);

    Product product = productService.findById(id);

    if (product == null) {
        log.warn("PRODUCT NOT FOUND : {}", id);
        return ResponseEntity.notFound().build();
    }

    log.info("PRODUCT FOUND SUCCESSFULLY");
    log.info("NAME : {}", product.getName());
    log.info("PRICE : {}", product.getPrice());
    log.info("QUANTITY : {}", product.getQuantity());

    return ResponseEntity.ok(product);
}
    @Override
    public ResponseEntity<Product> update(
            Long id,
            Product product) {

        log.info("========== UPDATE PRODUCT API HIT ==========");
        log.info("PRODUCT ID : {}", id);

        Product updatedProduct =
                productService.update(id, product);

        log.info("PRODUCT UPDATED SUCCESSFULLY");

        return ResponseEntity.ok(updatedProduct);
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {

        log.info("========== DELETE PRODUCT API HIT ==========");
        log.info("PRODUCT ID : {}", id);

        productService.delete(id);

        log.info("PRODUCT DELETED SUCCESSFULLY");

        return ResponseEntity.noContent().build();
    }

    
}