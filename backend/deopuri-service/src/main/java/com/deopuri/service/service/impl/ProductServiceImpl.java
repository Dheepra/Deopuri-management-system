package com.deopuri.service.service.impl;

import com.deopuri.api.dto.ProductImportResult;
import com.deopuri.api.dto.ProductRequest;
import com.deopuri.api.dto.ProductResponse;
import com.deopuri.api.dto.ProductVariantRequest;
import com.deopuri.api.dto.ProductVariantResponse;
import com.deopuri.api.model.Product;
import com.deopuri.api.model.ProductVariant;
import com.deopuri.exception.BusinessException;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.service.dao.ProductRepository;
import com.deopuri.service.dao.ProductVariantDao;
import com.deopuri.service.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    // Build the variants, de-duplicating by size. (product_id, size) is UNIQUE in the DB, so two
    // variants with the same size in the payload would each fire an insert and every duplicate would
    // fail with SQLState 23000 (duplicate entry) — turning one bad request into hundreds of failed
    // inserts and a 409. Keeping the first occurrence of each size avoids that and is idempotent.
    if (request.variants() != null) {
        Map<String, ProductVariant> bySize = new LinkedHashMap<>();

        for (ProductVariantRequest v : request.variants()) {
            String size = v.size() == null ? null : v.size().trim();
            if (size == null || size.isEmpty()) {
                log.warn("Skipping variant with blank size for product '{}'", request.name());
                continue;
            }
            if (bySize.containsKey(size)) {
                log.warn("Duplicate variant size '{}' in create payload for product '{}' — keeping the first",
                        size, request.name());
                continue;
            }
            ProductVariant pv = new ProductVariant();
            pv.setSize(size);
            pv.setStock(v.stock());
            pv.setPrice(v.price());
            pv.setProduct(product);
            bySize.put(size, pv);
        }

        product.setVariants(new ArrayList<>(bySize.values()));
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

    // ================= CSV IMPORT =================

    @Override
    public ProductImportResult importProducts(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BusinessException("bad_file", "No file was uploaded.");
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean looksCsv = (filename != null && filename.toLowerCase().endsWith(".csv"))
                || (contentType != null && contentType.toLowerCase().contains("csv"))
                || (contentType != null && contentType.toLowerCase().startsWith("text/"));
        if (!looksCsv) {
            throw new BusinessException("bad_file", "Only .csv files are supported.");
        }

        int total = 0;
        int imported = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String headerLine = reader.readLine();
            while (headerLine != null && headerLine.trim().isEmpty()) {
                headerLine = reader.readLine();
            }
            if (headerLine == null) {
                throw new BusinessException("bad_file", "The CSV file is empty.");
            }

            // Strip a leading UTF-8 BOM if present.
            if (headerLine.startsWith("﻿")) {
                headerLine = headerLine.substring(1);
            }

            List<String> headers = parseCsvLine(headerLine);
            Map<String, Integer> columns = new HashMap<>();
            for (int i = 0; i < headers.size(); i++) {
                columns.put(headers.get(i).trim().toLowerCase(), i);
            }

            if (!columns.containsKey("name") || !columns.containsKey("price")) {
                throw new BusinessException("bad_file",
                        "CSV must contain at least 'name' and 'price' columns.");
            }

            String line;
            // Row number shown to the user is 1-based including the header row,
            // so the first data row is row 2.
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;

                // Skip fully-blank lines (empty or only commas / whitespace).
                if (line.trim().isEmpty() || line.replace(",", "").trim().isEmpty()) {
                    continue;
                }

                total++;

                try {
                    List<String> cells = parseCsvLine(line);

                    String name = cell(cells, columns.get("name"));
                    if (name == null || name.isBlank()) {
                        errors.add("row " + rowNumber + ": missing name");
                        continue;
                    }

                    String priceRaw = cell(cells, columns.get("price"));
                    if (priceRaw == null || priceRaw.isBlank()) {
                        errors.add("row " + rowNumber + ": missing price");
                        continue;
                    }

                    Double price;
                    try {
                        price = Double.parseDouble(priceRaw.trim());
                    } catch (NumberFormatException nfe) {
                        errors.add("row " + rowNumber + ": bad price '" + priceRaw.trim() + "'");
                        continue;
                    }

                    int quantity = 0;
                    String quantityRaw = cell(cells, columns.get("quantity"));
                    if (quantityRaw != null && !quantityRaw.isBlank()) {
                        try {
                            quantity = Integer.parseInt(quantityRaw.trim());
                        } catch (NumberFormatException nfe) {
                            errors.add("row " + rowNumber + ": bad quantity '" + quantityRaw.trim() + "'");
                            continue;
                        }
                    }

                    String description = cell(cells, columns.get("description"));

                    // NOTE: the Product model has no 'category' field, so the CSV
                    // 'category' column (if present) is parsed but not persisted.

                    // Reuse the existing create path. No image and no variants for
                    // CSV-imported products (the model allows both to be absent).
                    ProductRequest request = new ProductRequest(
                            name.trim(),
                            description == null ? null : description.trim(),
                            price,
                            quantity,
                            null,   // manufacturingDate
                            null,   // imageUrl
                            null    // variants
                    );

                    create(request, null);
                    imported++;

                } catch (Exception e) {
                    // One bad row must never abort the whole import.
                    log.warn("CSV import: failed to import row {}", rowNumber, e);
                    errors.add("row " + rowNumber + ": " + e.getMessage());
                }
            }

        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            log.error("CSV import failed", e);
            throw new BusinessException("bad_file", "Could not read the CSV file: " + e.getMessage(), e);
        }

        int skipped = total - imported;
        log.info("CSV import complete: total={}, imported={}, skipped={}", total, imported, skipped);
        return new ProductImportResult(total, imported, skipped, errors);
    }

    /**
     * Parse a single CSV line into cells. Handles simple double-quoted cells
     * (which may contain commas and escaped {@code ""} quotes). Not a full RFC
     * 4180 parser (no multi-line quoted fields), which is sufficient here.
     */
    private static List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"'); // escaped quote
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else {
                if (c == '"') {
                    inQuotes = true;
                } else if (c == ',') {
                    result.add(current.toString());
                    current.setLength(0);
                } else {
                    current.append(c);
                }
            }
        }
        result.add(current.toString());
        return result;
    }

    /** Safely read a cell by (possibly null) column index, returning null if absent. */
    private static String cell(List<String> cells, Integer index) {
        if (index == null || index < 0 || index >= cells.size()) {
            return null;
        }
        String value = cells.get(index);
        return value == null ? null : value.trim();
    }
}
