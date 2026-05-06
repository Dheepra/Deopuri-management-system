package com.backend.deopuri.service.dao;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.deopuri.api.model.Users;



@Repository
public interface UsersDao extends JpaRepository<Users, Integer> {

    Users findByEmail(String email);	
    

    List<Users> findByFirstNameStartingWithIgnoreCase(String firstName);

    List<Users> findByStatus(String status);

    
    
    
   
}
