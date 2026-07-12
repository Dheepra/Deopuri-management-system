package com.deopuri.service.service.impl;

import com.deopuri.api.dto.CreateRawMaterialRequest;
import com.deopuri.api.dto.RawMaterialResponse;
import com.deopuri.api.dto.UpdateRawMaterialRequest;
import com.deopuri.api.model.Expense;
import com.deopuri.api.model.ExpenseType;
import com.deopuri.api.model.RawMaterial;
import com.deopuri.api.model.ReferenceType;
import com.deopuri.exception.ResourceNotFoundException;
import com.deopuri.service.dao.ExpenseDao;
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

    // A raw-material purchase IS a raw-material expense. We mirror it into the Expense table so the
    // Profit & Loss report counts it automatically (no double manual entry). The mirror row is linked
    // back via referenceType=RAW_MATERIAL + referenceId, so update/delete stay in sync.
    @Autowired
    private ExpenseDao expenseDao;

    private double lineCost(RawMaterial rm) {
        double qty = rm.getQuantity() == null ? 0.0 : rm.getQuantity();
        double unit = rm.getUnitPrice() == null ? 0.0 : rm.getUnitPrice();
        return qty * unit;
    }

    private void upsertLinkedExpense(RawMaterial rm) {
        List<Expense> existing =
                expenseDao.findByReferenceTypeAndReferenceId(ReferenceType.RAW_MATERIAL, rm.getId());
        Expense e = existing.isEmpty() ? new Expense() : existing.get(0);

        e.setExpenseName("Raw material: " + rm.getName());
        e.setExpenseType(ExpenseType.RAW_MATERIAL);
        e.setAmount(lineCost(rm));
        e.setDescription(rm.getSupplierName() != null ? "Supplier: " + rm.getSupplierName() : null);
        e.setExpenseDate(rm.getPurchaseDate());
        e.setReferenceType(ReferenceType.RAW_MATERIAL);
        e.setReferenceId(rm.getId());

        expenseDao.save(e);
    }

    private void deleteLinkedExpense(Long rawMaterialId) {
        List<Expense> linked =
                expenseDao.findByReferenceTypeAndReferenceId(ReferenceType.RAW_MATERIAL, rawMaterialId);
        if (!linked.isEmpty()) {
            expenseDao.deleteAll(linked);
        }
    }

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
        upsertLinkedExpense(rawMaterial);

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
        upsertLinkedExpense(rawMaterial);

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

        deleteLinkedExpense(rawMaterial.getId());
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