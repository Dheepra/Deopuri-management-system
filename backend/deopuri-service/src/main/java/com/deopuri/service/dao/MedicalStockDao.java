package com.deopuri.service.dao;

import com.deopuri.api.model.MedicalStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalStockDao extends JpaRepository<MedicalStock, Long> {

    List<MedicalStock> findByOwnerId(Integer ownerId);

    Optional<MedicalStock> findByOwnerIdAndProductName(Integer ownerId, String productName);
}
