package com.backend.deopuri.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.backend.deopuri.api.model.Users;
import com.backend.deopuri.service.dao.UsersDao;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersDao dao;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Users user = dao.findByEmail(email);

        if(user == null){
            throw new UsernameNotFoundException("User not found");
        }

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRoleBase())
                .build();
    }
}