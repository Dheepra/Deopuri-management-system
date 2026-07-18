package com.deopuri.service.dao;

import com.deopuri.api.model.MedicalBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalBillDao extends JpaRepository<MedicalBill, Long> {

    List<MedicalBill> findByOwnerId(Integer ownerId);

    Optional<MedicalBill> findByOwnerIdAndBillNumber(Integer ownerId, String billNumber);
}
