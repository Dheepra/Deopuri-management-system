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
                        .requestMatchers("/api/hospital-admin/**").permitAll()
                        .requestMatchers("/api/doctors/**").permitAll()

                        .requestMatchers(
                                "/api/appointments/**")
                        .permitAll()

                        .requestMatchers(
                                "/api/hospitals")
                        .permitAll()

                        .requestMatchers("/api/admin/approve-user/**")
                        .permitAll()

                        .requestMatchers("/api/orders/**")
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

        config.setAllowedOrigins(List.of("http://localhost:5173"));

        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}