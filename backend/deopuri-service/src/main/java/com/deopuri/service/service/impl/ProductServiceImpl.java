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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
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
public ProductResponse create(ProductRequest request, String imageUrl) {

    Product product = new Product();
    product.setName(request.name());
    product.setDescription(request.description());
    product.setPrice(request.price());
    product.setQuantity(request.quantity());
    product.setManufacturingDate(request.manufacturingDate());
    product.setImageUrl(imageUrl);

    // ✅ IMPORTANT FIX
    if (request.variants() != null) {
        List<ProductVariant> list = new ArrayList<>();

        for (ProductVariantRequest v : request.variants()) {
            ProductVariant pv = new ProductVariant();
            pv.setSize(v.size());
            pv.setStock(v.stock());
            pv.setPrice(v.price());
            pv.setProduct(product);
            list.add(pv);
        }

        product.setVariants(list);
    }

    Product saved = productRepository.save(product);

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
    @Transactional
  public ProductResponse update(Long id, ProductRequest request, String imageUrl) {

        log.info("🔵 UPDATE PRODUCT START - id={}", id);

        Product product = loadProduct(id);

        log.info("🟢 Product loaded - id={}, name={}", product.getId(), product.getName());

        // ================= PRODUCT FIELDS UPDATE =================
        if (request.name() != null)
            product.setName(request.name());

        if (request.description() != null)
            product.setDescription(request.description());

        if (request.price() != null)
            product.setPrice(request.price());

        if (request.quantity() != null)
            product.setQuantity(request.quantity());

        if (request.manufacturingDate() != null)
            product.setManufacturingDate(request.manufacturingDate());

        if (request.imageUrl() != null)
            product.setImageUrl(request.imageUrl());

        // ================= VARIANT UPDATE ONLY =================
        if (request.variants() != null && !request.variants().isEmpty()) {

            if (product.getVariants() == null) {
                product.setVariants(new java.util.ArrayList<>());
            }

            for (ProductVariantRequest v : request.variants()) {

                product.getVariants()
                        .stream()
                        .filter(existing -> existing.getSize().equals(v.size()))
                        .findFirst()
                        .ifPresentOrElse(existing -> {

                            // ✅ UPDATE ONLY
                            log.info("♻️ Updating variant size={}", v.size());

                            existing.setStock(v.stock());
                            existing.setPrice(v.price());

                        }, () -> {

                            // ❌ NO ADD (your requirement)
                            log.warn("⚠️ Variant not found for size={}, skipping", v.size());
                        });
            }

            log.info("✅ Variant update completed. Total variants={}",
                    product.getVariants().size());

        } else {
            log.warn("⚠️ No variants provided in request");
        }

        // ================= SAVE =================
        Product saved = productRepository.save(product);

        log.info("💾 Product saved successfully id={}", saved.getId());

        return ProductMapper.toResponse(saved);
    }

    @Override
    public void delete(Long id) {

        Product product = loadProduct(id);

        if (!product.getVariants().isEmpty()) {
            log.warn("⚠️ Deleting product with variants first");
            product.getVariants().clear();
        }

        productRepository.delete(product);

        log.info("🗑️ Product deleted id={}", id);
    }

    @Override
    public ProductVariantResponse addVariant(Long productId, ProductVariantRequest request) {
        Product product = loadProduct(productId);

        ProductVariant variant = new ProductVariant();
        variant.setSize(request.size());
        variant.setStock(request.stock());
        variant.setPrice(request.price()); // 👈 NEW
        variant.setProduct(product);

        ProductVariant saved = variantDao.save(variant);
        log.info("Variant created id={} productId={}", saved.getId(), productId);
        return ProductMapper.toResponse(saved);
    }

    @Override
    public String uploadImage(MultipartFile image) {

        try {
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();

            Path path = Paths.get("uploads", fileName);

            Files.createDirectories(path.getParent());

            Files.write(path, image.getBytes());

            return "/uploads/" + fileName;

        } catch (Exception e) {
            log.error("Image upload failed filename={}", image.getOriginalFilename(), e);
            throw new RuntimeException("Image upload failed", e);
        }
    }

    private Product loadProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }
}
