package com.backend.deopuri.security.config;

import com.backend.deopuri.security.jwt.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // MAIN SECURITY CONFIG
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // disable csrf for REST API
            .csrf(csrf -> csrf.disable())

            // URL AUTH RULES
            .authorizeHttpRequests(auth -> auth

                // PUBLIC APIs
                .requestMatchers("/api/login", "/api/register").permitAll()
                .requestMatchers("/api/products/**").permitAll()
              
                .requestMatchers("/api/orders/**").authenticated()
                // ADMIN ONLY
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // everything else needs login
                .anyRequest().authenticated()
            )

            // STATELESS SESSION (JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // JWT FILTER
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}