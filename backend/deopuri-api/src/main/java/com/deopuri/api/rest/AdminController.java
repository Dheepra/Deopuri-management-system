package com.deopuri.api.rest;

import com.deopuri.api.dto.UserResponse;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/deopuri/admin")
public interface AdminController {

    @GetMapping("/approve-user/{id}")
    ResponseEntity<UserResponse> approveUser(
            @PathVariable int id);

    @GetMapping("/pending-users")
    ResponseEntity<List<UserResponse>> getPendingUsers();

     
}