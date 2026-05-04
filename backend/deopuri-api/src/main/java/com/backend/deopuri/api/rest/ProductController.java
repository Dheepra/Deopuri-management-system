package com.backend.deopuri.api.rest;

import com.backend.deopuri.api.model.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * REST contract (api layer). Implementation lives in {@code deopuri-service} as {@code ProductControllerImpl}.
 */
@RequestMapping(ProductApiPaths.BASE)
public interface ProductController {

	@PostMapping
	ResponseEntity<Product> create(@RequestBody Product product);

	@GetMapping
	ResponseEntity<List<Product>> findAll();

	@GetMapping("/{id}")
	ResponseEntity<Product> findById(@PathVariable Long id);

	@PutMapping("/{id}")
	ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product);

	@DeleteMapping("/{id}")
	ResponseEntity<Void> delete(@PathVariable Long id);
}
