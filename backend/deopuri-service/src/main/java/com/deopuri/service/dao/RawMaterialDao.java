package com.deopuri.service.dao;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.deopuri.api.model.RawMaterial;

@Repository
public interface RawMaterialDao extends JpaRepository<RawMaterial, Long> {

}