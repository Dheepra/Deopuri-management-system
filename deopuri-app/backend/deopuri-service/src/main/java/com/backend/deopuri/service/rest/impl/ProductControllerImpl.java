package com.backend.deopuri.service.rest.impl;

import com.backend.deopuri.api.model.Product;
import com.backend.deopuri.api.rest.ProductController;
import com.backend.deopuri.service.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
public class ProductControllerImpl implements ProductController {

	private final ProductService productService;

	public ProductControllerImpl(ProductService productService) {
		this.productService = productService;
	}

	@Override
	public ResponseEntity<Product> create(Product product) {
		return new ResponseEntity<>(productService.create(product), HttpStatus.CREATED);
	}

	@Override
	public ResponseEntity<List<Product>> findAll() {
		return ResponseEntity.ok(productService.findAll());
	}

	@Override
	public ResponseEntity<Product> findById(Long id) {
		try {
			return ResponseEntity.ok(productService.findById(id));
		} catch (NoSuchElementException ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@Override
	public ResponseEntity<Product> update(Long id, Product product) {
		try {
			return ResponseEntity.ok(productService.update(id, product));
		} catch (NoSuchElementException ex) {
			return ResponseEntity.notFound().build();
		}
	}

	@Override
	public ResponseEntity<Void> delete(Long id) {
		try {
			productService.delete(id);
			return ResponseEntity.noContent().build();
		} catch (NoSuchElementException ex) {
			return ResponseEntity.notFound().build();
		}
	}
}
