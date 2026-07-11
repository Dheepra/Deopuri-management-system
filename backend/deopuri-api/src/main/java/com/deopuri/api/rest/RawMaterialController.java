package com.deopuri.api.rest;

import com.deopuri.api.dto.CreateRawMaterialRequest;
import com.deopuri.api.dto.RawMaterialResponse;
import com.deopuri.api.dto.UpdateRawMaterialRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/raw-material")
public interface RawMaterialController {

    @PostMapping
    ResponseEntity<RawMaterialResponse> create(
            @Valid @RequestBody CreateRawMaterialRequest request
    );

    @GetMapping
    ResponseEntity<List<RawMaterialResponse>> findAll();

    @GetMapping("/{id}")
    ResponseEntity<RawMaterialResponse> findById(
            @PathVariable Long id
    );

    @PutMapping("/{id}")
    ResponseEntity<RawMaterialResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRawMaterialRequest request
    );

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @PathVariable Long id
    );
}