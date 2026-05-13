package com.deopuri.security;

import com.deopuri.api.model.UserStatus;
import com.deopuri.api.model.Users;
import com.deopuri.service.dao.UsersDao;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersDao dao;

    public CustomUserDetailsService(UsersDao dao) {
        this.dao = dao;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = dao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean enabled = user.getStatus() == UserStatus.APPROVED;

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .disabled(!enabled)
                .build();
    }
}
