package com.backend.deopuri.service.rest.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.api.rest.UserApiPaths;
import com.backend.deopuri.api.rest.UserController;
import com.backend.deopuri.service.service.UserServices;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class UserControllerImpl implements UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserControllerImpl.class);

    @Autowired
    private UserServices service;

    @PostMapping(UserApiPaths.REGISTER)

    public String registerUser(@Valid @RequestBody Users user) {
        return service.register(user);
    }

    // 👉 yahi add karna hai
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        return errors;
    }

    @Override
    public Object loginUser(Users user) {

        Users validUser = service.login(user.getEmail(), user.getPassword());

        if (validUser != null) {
            if ("ADMIN".equalsIgnoreCase(validUser.getRoleBase())) {
                return "Welcome Admin";
            } else if ("HOSPITAL".equalsIgnoreCase(validUser.getRoleBase())) {
                return "Welcome Hospital";
            } else {
                return "Welcome Medical";
            }
        }
        return "Invalid Email or Password";
    }

    @Override
    public List<Users> getAllUsers() {
        return service.getAllUsers();
    }

    @Override
    public Users getUserById(int id) {
        return service.getUserById(id);
    }

    @Override
    public List<Users> getUsersByName(String name) {
        return service.getUserssearchByFirstName(name);
    }

    @Override
    public ResponseEntity<?> updateUser(int id, Users user) {

        Users existingUser = service.getUserById(id);

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        List<String> updatedFields = new ArrayList<>();

        if (user.getFirstName() != null && !user.getFirstName().equals(existingUser.getFirstName())) {
            existingUser.setFirstName(user.getFirstName());
            updatedFields.add("firstName updated successfully");
        }

        if (user.getLastName() != null && !user.getLastName().equals(existingUser.getLastName())) {
            existingUser.setLastName(user.getLastName());
            updatedFields.add("lastName updated successfully");
        }

        if (user.getEmail() != null && !user.getEmail().equals(existingUser.getEmail())) {
            existingUser.setEmail(user.getEmail());
            updatedFields.add("email updated successfully");
        }

        if (user.getPassword() != null && !user.getPassword().equals(existingUser.getPassword())) {
            existingUser.setPassword(user.getPassword());
            updatedFields.add("password updated successfully");
        }

        if (user.getMobileNo() != null && !user.getMobileNo().equals(existingUser.getMobileNo())) {
            existingUser.setMobileNo(user.getMobileNo());
            updatedFields.add("mobile no updated successfully");
        }

        if (user.getAddress() != null && !user.getAddress().equals(existingUser.getAddress())) {
            existingUser.setAddress(user.getAddress());
            updatedFields.add("address updated successfully");
        }

        if (user.getShopName() != null && !user.getShopName().equals(existingUser.getShopName())) {
            existingUser.setShopName(user.getShopName());
            updatedFields.add("shopName updated successfully");
        }

        if (user.getRoleBase() != null && !user.getRoleBase().equals(existingUser.getRoleBase())) {
            existingUser.setRoleBase(user.getRoleBase());
            updatedFields.add("roleBase updated successfully");
        }

        service.save(existingUser);

        if (updatedFields.isEmpty()) {
            return ResponseEntity.ok("No fields were updated");
        } else {
            return ResponseEntity.ok(String.join(", ", updatedFields));
        }
    }

    @Override
    public String deleteUser(int id) {
        return service.deleteUser(id);
    }

}