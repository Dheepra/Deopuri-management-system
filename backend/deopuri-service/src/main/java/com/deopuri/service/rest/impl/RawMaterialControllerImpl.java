package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.CreateRawMaterialRequest;
import com.deopuri.api.dto.RawMaterialResponse;
import com.deopuri.api.dto.UpdateRawMaterialRequest;
import com.deopuri.api.rest.RawMaterialController;
import com.deopuri.service.service.RawMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RawMaterialControllerImpl implements RawMaterialController {

    @Autowired
    private RawMaterialService rawMaterialService;

    @Override
    public ResponseEntity<RawMaterialResponse> create(CreateRawMaterialRequest request) {

        return ResponseEntity.ok(rawMaterialService.create(request));
    }

    @Override
    public ResponseEntity<List<RawMaterialResponse>> findAll() {

        return ResponseEntity.ok(rawMaterialService.getAll());
    }

    @Override
    public ResponseEntity<RawMaterialResponse> findById(Long id) {

        return ResponseEntity.ok(rawMaterialService.getById(id));
    }

    @Override
    public ResponseEntity<RawMaterialResponse> update(Long id,
                                                      UpdateRawMaterialRequest request) {

        return ResponseEntity.ok(rawMaterialService.update(id, request));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {

        rawMaterialService.delete(id);

        return ResponseEntity.noContent().build();
    }
}