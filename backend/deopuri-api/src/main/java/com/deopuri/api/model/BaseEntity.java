package com.deopuri.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Common SaaS audit base for every persisted entity.
 *
 * <ul>
 *   <li>{@code createdTime} / {@code modifiedTime} — stamped by JPA lifecycle callbacks here.</li>
 *   <li>{@code creatorId} / {@code modifierId} — the id of the user who created / last modified the
 *       row, populated by Spring Data JPA auditing ({@code @CreatedBy}/{@code @LastModifiedBy}) via the
 *       {@code AuditorAware<Integer>} bean (current user's id, or empty for system/unauthenticated).</li>
 * </ul>
 *
 * <p>Dates use plain {@code @PrePersist}/{@code @PreUpdate} (not {@code @CreatedDate}) so a subclass
 * can override {@code createdTime} in its own callback — e.g. Orders uses its own {@code orderDate}.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Column(name = "created_time", updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "modified_time")
    private LocalDateTime modifiedTime;

    // Soft FK to users.id — who created / last modified this row.
    @CreatedBy
    @Column(name = "creator_id", updatable = false)
    private Integer creatorId;

    @LastModifiedBy
    @Column(name = "modifier_id")
    private Integer modifierId;

    // Unique names (not onCreate/onUpdate) so they never clash with a subclass's own @PrePersist
    // callback — JPA invokes the mapped-superclass callback AND the entity callback (superclass first).
    @PrePersist
    protected void auditPrePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdTime = now;
        this.modifiedTime = now;
    }

    @PreUpdate
    protected void auditPreUpdate() {
        this.modifiedTime = LocalDateTime.now();
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }

    public LocalDateTime getModifiedTime() {
        return modifiedTime;
    }

    public void setModifiedTime(LocalDateTime modifiedTime) {
        this.modifiedTime = modifiedTime;
    }

    public Integer getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Integer creatorId) {
        this.creatorId = creatorId;
    }

    public Integer getModifierId() {
        return modifierId;
    }

    public void setModifierId(Integer modifierId) {
        this.modifierId = modifierId;
    }
}
