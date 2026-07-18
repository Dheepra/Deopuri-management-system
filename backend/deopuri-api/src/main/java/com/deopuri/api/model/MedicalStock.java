package com.deopuri.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * A medical admin's own inventory line. Rows are created automatically when one of their
 * purchase orders from the company is delivered (see MedicalLedgerService#ingestDeliveredOrder)
 * and can also be added/edited manually. Everything is scoped to {@code ownerId} (the medical
 * admin's user id) so each admin only ever sees their own stock.
 */
@Entity
@Table(name = "medical_stock")
public class MedicalStock extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Integer ownerId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private int quantity;

    // Per-unit cost (what the admin paid the company). Drives COGS / profit.
    @Column(name = "cost_price")
    private Double costPrice;

    // Per-unit retail price the admin sells at. Defaults to cost; the admin edits it up.
    @Column(name = "retail_price")
    private Double retailPrice;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "source_order_number")
    private String sourceOrderNumber;

    public MedicalStock() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Integer ownerId) {
        this.ownerId = ownerId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Double getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(Double costPrice) {
        this.costPrice = costPrice;
    }

    public Double getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(Double retailPrice) {
        this.retailPrice = retailPrice;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getSourceOrderNumber() {
        return sourceOrderNumber;
    }

    public void setSourceOrderNumber(String sourceOrderNumber) {
        this.sourceOrderNumber = sourceOrderNumber;
    }
}
