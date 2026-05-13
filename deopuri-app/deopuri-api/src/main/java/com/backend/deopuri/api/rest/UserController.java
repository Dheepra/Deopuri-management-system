package com.backend.deopuri.api.rest;

import java.util.List;
import com.backend.deopuri.api.model.Users;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping(UserApiPaths.BASE)
public interface UserController {

    @PostMapping(UserApiPaths.REGISTER)
    String registerUser(@Valid @RequestBody Users user);

    @PostMapping(UserApiPaths.LOGIN)
    String loginUser(@RequestBody Users user);

    @GetMapping(UserApiPaths.GET_ALL)
    List<Users> getAllUsers();

    @GetMapping(UserApiPaths.GET_BY_ID)
    Users getUserById(@PathVariable int id);

    @GetMapping(UserApiPaths.SEARCH)
    List<Users> getUsersByName(@PathVariable String name);

    @PutMapping(UserApiPaths.UPDATE)
    ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody Users user);

    @DeleteMapping(UserApiPaths.DELETE)
    String deleteUser(@PathVariable int id);

    // ✅ FINAL (ONLY THESE KEEP)
   
    String approveUser(@PathVariable int id, @RequestParam String adminEmail);


    
    @PutMapping(UserApiPaths.REJECT)
    String rejectUser(@PathVariable int id, @RequestParam String adminEmail);

    @GetMapping(UserApiPaths.PENDING)
    List<Users> getPendingUsers();
}