package com.shopnest.product_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filter that:
 * 1. Reads X-User-Roles / X-Auth-Username headers from API Gateway, OR
 * 2. Falls back to parsing JWT from Authorization header,
 * and populates SecurityContext with roles for role-based access control.
 */
@Component
public class RoleAuthenticationFilter extends OncePerRequestFilter {

    private static final String ROLES_HEADER = "X-User-Roles";
    private static final String USERNAME_HEADER = "X-Auth-Username";

    private final JwtUtil jwtUtil;

    public RoleAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String username = null;
        List<String> roles = new ArrayList<>();

        // 1) Prefer headers from API Gateway
        String rolesHeader = request.getHeader(ROLES_HEADER);
        String headerUsername = request.getHeader(USERNAME_HEADER);
        if (rolesHeader != null && !rolesHeader.isBlank() && headerUsername != null && !headerUsername.isBlank()) {
            username = headerUsername;
            roles = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else {
            // 2) Fallback to JWT from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtil.validateToken(token)) {
                    username = jwtUtil.getUsernameFromToken(token);
                    roles = jwtUtil.getRolesFromToken(token);
                }
            }
        }

        if (username != null && !roles.isEmpty()) {
            var authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

