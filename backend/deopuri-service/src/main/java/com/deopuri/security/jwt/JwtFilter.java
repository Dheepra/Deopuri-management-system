package com.deopuri.security.jwt;

import com.deopuri.security.PublicEndpoints;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final com.deopuri.security.CustomUserDetailsService userDetailsService;
    private final PublicEndpoints publicEndpoints;

    public JwtFilter(JwtUtil jwtUtil,
                     com.deopuri.security.CustomUserDetailsService userDetailsService,
                     PublicEndpoints publicEndpoints) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.publicEndpoints = publicEndpoints;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return publicEndpoints.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            String username = jwtUtil.extractUsername(token);

            if (StringUtils.hasText(username)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            log.debug("Expired JWT for {}: {}", request.getRequestURI(), e.getMessage());
            sendUnauthorized(response, "token_expired", "Token has expired");
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT for {}: {}", request.getRequestURI(), e.getMessage());
            sendUnauthorized(response, "invalid_token", "Invalid authentication token");
        } catch (UsernameNotFoundException e) {
            log.warn("Token references unknown user for {}: {}", request.getRequestURI(), e.getMessage());
            sendUnauthorized(response, "invalid_token", "Invalid authentication token");
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String error, String message)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setHeader("WWW-Authenticate", "Bearer error=\"" + error + "\"");
        response.getWriter().write(
                "{\"status\":401,\"error\":\"" + error + "\",\"message\":\"" + message + "\"}");
    }
}
