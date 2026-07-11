package com.deopuri.service.service;

import java.util.List;

import com.deopuri.api.dto.CreateRawMaterialRequest;
import com.deopuri.api.dto.RawMaterialResponse;
import com.deopuri.api.dto.UpdateRawMaterialRequest;

public interface RawMaterialService {

    RawMaterialResponse create(CreateRawMaterialRequest request);

    RawMaterialResponse update(Long id, UpdateRawMaterialRequest request);

    RawMaterialResponse getById(Long id);

    List<RawMaterialResponse> getAll();

    void delete(Long id);
}