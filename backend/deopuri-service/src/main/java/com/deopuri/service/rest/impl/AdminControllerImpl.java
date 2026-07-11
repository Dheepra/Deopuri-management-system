package com.deopuri.service.rest.impl;

import com.deopuri.api.dto.UserResponse;
import com.deopuri.api.rest.AdminController;

import com.deopuri.service.service.UserServices;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
public class AdminControllerImpl implements AdminController {

    @Autowired
    private UserServices userService;


    @Override
    public ResponseEntity<UserResponse> approveUser(int id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @Override
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    
}