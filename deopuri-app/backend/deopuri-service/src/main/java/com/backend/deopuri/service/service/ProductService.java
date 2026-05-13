package com.backend.deopuri.service.service;

import com.backend.deopuri.api.model.Product;

import java.util.List;

public interface ProductService {

	Product create(Product product);

	List<Product> findAll();

	Product findById(Long id);

	Product update(Long id, Product product);

	void delete(Long id);
}
