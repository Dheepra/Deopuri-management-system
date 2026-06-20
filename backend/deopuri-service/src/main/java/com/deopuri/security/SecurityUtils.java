package com.deopuri.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Not authenticated");
        }
        return auth.getName();
    }

    // 🔥 NEW METHOD (ADD THIS)
    public static String currentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        return auth.getAuthorities()
                .stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .findFirst()
                .orElse("UNKNOWN");
    }
}
