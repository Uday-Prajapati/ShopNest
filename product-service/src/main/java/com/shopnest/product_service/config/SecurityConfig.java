package com.shopnest.product_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final RoleAuthenticationFilter roleAuthenticationFilter;

    public SecurityConfig(RoleAuthenticationFilter roleAuthenticationFilter) {
        this.roleAuthenticationFilter = roleAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(roleAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth ->
                auth
                    .requestMatchers("/api/products/health").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/products/*/stock").permitAll() // Internal call from order-service
                    .requestMatchers(HttpMethod.POST, "/api/products", "/api/products/**").hasRole("MERCHANT")
                    .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("MERCHANT")
                    .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasAnyRole("MERCHANT", "ADMIN")
                    .anyRequest().authenticated()
            );

        return http.build();
    }
}

