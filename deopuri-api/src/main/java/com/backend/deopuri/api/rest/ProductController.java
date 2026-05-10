package com.backend.deopuri.api.rest;

import com.backend.deopuri.api.model.Product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping(ProductApiPaths.BASE)
public interface ProductController {

    @PostMapping(ProductApiPaths.ADD)
    ResponseEntity<Product> addProduct(
            @RequestBody Product product
    );

    @GetMapping(ProductApiPaths.GET_ALL)
    ResponseEntity<List<Product>> findAll();

    @GetMapping(ProductApiPaths.GET_BY_ID)
    ResponseEntity<Product> findById(
            @PathVariable Long id
    );

    @PutMapping(ProductApiPaths.UPDATE)
    ResponseEntity<Product> update(
            @PathVariable Long id,
            @RequestBody Product product
    );

    @DeleteMapping(ProductApiPaths.DELETE)
    ResponseEntity<Void> delete(
            @PathVariable Long id
    );

    
}