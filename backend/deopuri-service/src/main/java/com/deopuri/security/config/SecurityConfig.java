package com.deopuri.security.config;

import com.deopuri.security.PublicEndpoints;
import com.deopuri.security.jwt.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final PublicEndpoints publicEndpoints;

    public SecurityConfig(JwtFilter jwtFilter, PublicEndpoints publicEndpoints) {
        this.jwtFilter = jwtFilter;
        this.publicEndpoints = publicEndpoints;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ✅ FIX: PublicEndpoints properly applied
                        .requestMatchers(publicEndpoints.matcher())
                        .permitAll()

                        // 🔥 IMPORTANT FIX (fallback safety)
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // Creating a doctor is a privileged hospital-admin action — never public.
                        .requestMatchers(HttpMethod.POST, "/api/hospital-admin/doctors")
                        .hasRole("HOSPITAL_ADMIN")
                        // The rest of the hospital-admin surface (doctor lookups) requires a login.
                        .requestMatchers("/api/hospital-admin/**").authenticated()

                        // NOTE: /api/appointments/** is still public here (IDOR — Tier-2).
                        // Securing it needs the frontend to send the JWT on those calls first
                        // (several use tokenless axios/fetch), so tighten together.
                        .requestMatchers(
                                "/api/appointments/**")
                        .permitAll()

                        .requestMatchers(
                                "/api/hospitals")
                        .permitAll()

                        .requestMatchers(
                                "/uploads/**")
                        .permitAll()

                        // approve-user is state-changing and admin-only. It falls through to the
                        // /api/admin/** -> hasRole('ADMIN') rule below (no permitAll).

                        // Cart is per-user; the acting user is derived from the JWT.
                        .requestMatchers("/api/cart/**")
                        .authenticated()

                        .requestMatchers("/api/orders/**")
                        .authenticated()

                        // Recording a payment is an admin-only action (admin Payments UI).
                        // GET history stays authenticated and is owner/admin-scoped in the service.
                        .requestMatchers(HttpMethod.POST, "/api/payments/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/payments/**")
                        .authenticated()

                        // USER NOTIFICATIONS
                        .requestMatchers("/api/user/notifications")
                        .authenticated()

                        // ADMIN NOTIFICATIONS
                        .requestMatchers("/api/admin/notifications")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/products/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/products/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/products/**")
                        .hasRole("ADMIN")

                        .anyRequest()
                        .authenticated())

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Allow the local dev origin AND phones on the same LAN (the Vite proxy forwards the phone's
        // real Origin, e.g. http://10.x.x.x:5173, so plain localhost-only CORS returns 403). Patterns
        // are used (not setAllowedOrigins) because wildcards require allowedOriginPatterns when
        // credentials are enabled. Tighten to your real origin(s) in production.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://10.*:5173",
                "http://192.168.*:5173",
                "http://172.16.*:5173",
                "http://172.17.*:5173",
                "http://172.18.*:5173"));

        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}