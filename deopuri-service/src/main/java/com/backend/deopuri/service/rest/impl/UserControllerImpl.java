package com.backend.deopuri.service.rest.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.api.rest.UserApiPaths;
import com.backend.deopuri.api.rest.UserController;
import com.backend.deopuri.service.service.UserServices;

import jakarta.validation.Valid;

@RestController
@RequestMapping(UserApiPaths.BASE)
@Validated
public class UserControllerImpl implements UserController {

    private static final Logger logger =
            LoggerFactory.getLogger(UserControllerImpl.class);

    @Autowired
    private UserServices service;

    // ================= REGISTER =================
    @PostMapping(UserApiPaths.REGISTER)
    public String registerUser(@Valid @RequestBody Users user) {

        logger.info("REGISTER USER API CALLED");
        logger.info("EMAIL : {}", user.getEmail());

        return service.register(user);
    }

    // ================= APPROVE =================
    @PutMapping(UserApiPaths.APPROVE)
    @Override
    public String approveUser(@PathVariable int id,
                              @RequestParam String adminEmail) {

        logger.info("APPROVE USER API CALLED");
        logger.info("USER ID : {}", id);

        return service.approveUser(id, adminEmail);
    }

    // ================= REJECT =================
    @PutMapping(UserApiPaths.REJECT)
    public String rejectUser(@PathVariable int id,
                              @RequestParam String adminEmail) {

        logger.warn("REJECT USER API CALLED");
        logger.warn("USER ID : {}", id);

        return service.rejectUser(id, adminEmail);
    }

    // ================= PENDING USERS =================
    @GetMapping(UserApiPaths.PENDING)
    public List<Users> getPendingUsers() {

        logger.info("GET PENDING USERS API CALLED");

        return service.getPendingUsers();
    }

    // ================= LOGIN =================
    @Override
    public String loginUser(Users user) {

        logger.info("LOGIN API CALLED");
        logger.info("EMAIL : {}", user.getEmail());

        return service.login(user.getEmail(), user.getPassword());
    }

    // ================= GET ALL =================
    @Override
    public List<Users> getAllUsers() {

        logger.info("GET ALL USERS API CALLED");

        return service.getAllUsers();
    }

    // ================= GET BY ID =================
    @Override
    public Users getUserById(int id) {

        logger.info("GET USER BY ID API CALLED : {}", id);

        return service.getUserById(id);
    }

    // ================= SEARCH =================
    @Override
    public List<Users> getUsersByName(String name) {

        logger.info("SEARCH USER API CALLED : {}", name);

        return service.getUserssearchByFirstName(name);
    }

    // ================= UPDATE =================
    @Override
    public ResponseEntity<?> updateUser(int id, Users user) {

        logger.info("UPDATE USER API CALLED : {}", id);

        Users existingUser = service.getUserById(id);

        if (existingUser == null) {

            logger.warn("USER NOT FOUND : {}", id);

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        List<String> updatedFields = new ArrayList<>();

        if (user.getFirstName() != null) {
            existingUser.setFirstName(user.getFirstName());
            updatedFields.add("firstName updated");
        }

        if (user.getLastName() != null) {
            existingUser.setLastName(user.getLastName());
            updatedFields.add("lastName updated");
        }

        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
            updatedFields.add("email updated");
        }

        if (user.getPassword() != null) {
            existingUser.setPassword(user.getPassword());
            updatedFields.add("password updated");
        }

        if (user.getMobileNo() != null) {
            existingUser.setMobileNo(user.getMobileNo());
            updatedFields.add("mobile updated");
        }

        if (user.getAddress() != null) {
            existingUser.setAddress(user.getAddress());
            updatedFields.add("address updated");
        }

        if (user.getShopName() != null) {
            existingUser.setShopName(user.getShopName());
            updatedFields.add("shopName updated");
        }

        if (user.getRoleBase() != null) {
            existingUser.setRoleBase(user.getRoleBase());
            updatedFields.add("role updated");
        }

        service.save(existingUser);

        logger.info("USER UPDATE COMPLETED : {}", id);

        if (updatedFields.isEmpty()) {
            return ResponseEntity.ok("No fields were updated");
        }

        return ResponseEntity.ok(String.join(", ", updatedFields));
    }

    // ================= DELETE =================
    @Override
    public String deleteUser(int id) {

        logger.warn("DELETE USER API CALLED : {}", id);

        return service.deleteUser(id);
    }
}