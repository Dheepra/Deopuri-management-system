package com.deopuri.service.service.impl;

import com.deopuri.api.dto.CreateRawMaterialRequest;
import com.deopuri.api.dto.RawMaterialResponse;
import com.deopuri.api.dto.UpdateRawMaterialRequest;
import com.deopuri.api.model.RawMaterial;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.service.dao.RawMaterialDao;
import com.deopuri.service.service.RawMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RawMaterialServiceImpl implements RawMaterialService {

    @Autowired
    private RawMaterialDao rawMaterialDao;

    // ================= CREATE =================

    @Override
    public RawMaterialResponse create(CreateRawMaterialRequest request) {

        RawMaterial rawMaterial = new RawMaterial();

        rawMaterial.setName(request.name());
        rawMaterial.setCategory(request.category());
        rawMaterial.setQuantity(request.quantity());
        rawMaterial.setUnit(request.unit());
        rawMaterial.setUnitPrice(request.unitPrice());
        rawMaterial.setSupplierName(request.supplierName());
        rawMaterial.setDescription(request.description());
        rawMaterial.setPurchaseDate(request.purchaseDate());

        rawMaterialDao.save(rawMaterial);

        return toResponse(rawMaterial);
    }

    // ================= UPDATE =================

    @Override
    public RawMaterialResponse update(Long id, UpdateRawMaterialRequest request) {

        RawMaterial rawMaterial = rawMaterialDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found with id " + id));

        rawMaterial.setName(request.name());
        rawMaterial.setCategory(request.category());
        rawMaterial.setQuantity(request.quantity());
        rawMaterial.setUnit(request.unit());
        rawMaterial.setUnitPrice(request.unitPrice());
        rawMaterial.setSupplierName(request.supplierName());
        rawMaterial.setDescription(request.description());
        rawMaterial.setPurchaseDate(request.purchaseDate());

        rawMaterialDao.save(rawMaterial);

        return toResponse(rawMaterial);
    }

    // ================= GET BY ID =================

    @Override
    public RawMaterialResponse getById(Long id) {

        RawMaterial rawMaterial = rawMaterialDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found with id " + id));

        return toResponse(rawMaterial);
    }

    // ================= GET ALL =================

    @Override
    public List<RawMaterialResponse> getAll() {

        return rawMaterialDao.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ================= DELETE =================

    @Override
    public void delete(Long id) {

        RawMaterial rawMaterial = rawMaterialDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found with id " + id));

        rawMaterialDao.delete(rawMaterial);
    }

    // ================= RESPONSE =================

    private RawMaterialResponse toResponse(RawMaterial rawMaterial) {

        return new RawMaterialResponse(
                rawMaterial.getId(),
                rawMaterial.getName(),
                rawMaterial.getCategory(),
                rawMaterial.getQuantity(),
                rawMaterial.getUnit(),
                rawMaterial.getUnitPrice(),
                rawMaterial.getSupplierName(),
                rawMaterial.getDescription(),
                rawMaterial.getPurchaseDate());
    }
}