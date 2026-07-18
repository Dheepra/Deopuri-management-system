package com.deopuri.service.dao;

import com.deopuri.api.model.MedicalExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalExpenseDao extends JpaRepository<MedicalExpense, Long> {

    List<MedicalExpense> findByOwnerId(Integer ownerId);
}
