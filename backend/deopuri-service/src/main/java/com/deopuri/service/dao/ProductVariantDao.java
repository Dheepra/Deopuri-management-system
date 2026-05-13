package com.deopuri.service.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.deopuri.api.model.ProductVariant;

public interface ProductVariantDao
       extends JpaRepository<ProductVariant, Integer>{

    List<ProductVariant> findByProductId(Long productId);

}