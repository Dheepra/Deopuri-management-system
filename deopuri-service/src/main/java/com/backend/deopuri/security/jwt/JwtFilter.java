package com.backend.deopuri.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        log.info("========== JWT FILTER START ==========");
        log.info("REQUEST URL : {}", request.getRequestURI());
        log.info("REQUEST METHOD : {}", request.getMethod());

        String path = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        // ================= SKIP PUBLIC ROUTES =================
        if (path.startsWith("/error")
                || path.equals("/api/login")
                || path.startsWith("/api/auth")
                || (request.getMethod().equals("GET") && path.startsWith("/api/products"))) {

            log.info("PUBLIC API - NO JWT REQUIRED");
            filterChain.doFilter(request, response);
            return;
        }

        // ================= NULL CHECK (IMPORTANT FIX) =================
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("NO VALID AUTH HEADER FOUND");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        log.info("TOKEN RECEIVED");

        try {

            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);

            log.info("USERNAME : {}", username);
            log.info("ROLE : {}", role);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("AUTHENTICATION SET SUCCESSFULLY");

        } catch (Exception e) {
            log.error("JWT ERROR : {}", e.getMessage());
        }

        log.info("=========== JWT FILTER END ===========");

        filterChain.doFilter(request, response);
    }
}