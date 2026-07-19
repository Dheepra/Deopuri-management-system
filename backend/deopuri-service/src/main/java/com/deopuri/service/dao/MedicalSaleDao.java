package com.deopuri.service.dao;

import com.deopuri.api.model.MedicalSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalSaleDao extends JpaRepository<MedicalSale, Long> {

    List<MedicalSale> findByOwnerId(Integer ownerId);

    List<MedicalSale> findByOwnerIdAndBillNumber(Integer ownerId, String billNumber);
}
