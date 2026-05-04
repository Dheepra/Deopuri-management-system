package com.backend.deopuri.service.service.impl;

import com.backend.deopuri.api.model.Product;
import com.backend.deopuri.service.dao.ProductRepository;
import com.backend.deopuri.service.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductServiceImpl implements ProductService {

	private final ProductRepository productRepository;

	public ProductServiceImpl(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Override
	public Product create(Product product) {
		return productRepository.save(product);
	}

	@Override
	public List<Product> findAll() {
		return productRepository.findAll();
	}

	@Override
	public Product findById(Long id) {
		return productRepository.findById(id)
				.orElseThrow(() -> new NoSuchElementException("Product not found with id: " + id));
	}

	@Override
	public Product update(Long id, Product product) {
		Product existing = findById(id);
		existing.setName(product.getName());
		existing.setDescription(product.getDescription());
		existing.setPrice(product.getPrice());
		existing.setQuantity(product.getQuantity());
		return productRepository.save(existing);
	}

	@Override
	public void delete(Long id) {
		Product existing = findById(id);
		productRepository.delete(existing);
	}
}
