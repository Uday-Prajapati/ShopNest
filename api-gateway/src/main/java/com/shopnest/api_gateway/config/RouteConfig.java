package com.shopnest.api_gateway.config;

import com.shopnest.api_gateway.filter.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {
    
    @Autowired
    private AuthenticationFilter authenticationFilter;
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service - Public routes (no filter)
                .route("auth-service-public", r -> r
                        .path("/api/auth/login", "/api/auth/register", "/api/auth/validate")
                        .uri("lb://AUTH-SERVICE"))
                
                // Auth Service protected routes (with filter)
                .route("auth-service-protected", r -> r
                        .path("/api/auth/me")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://AUTH-SERVICE"))
                
                // Profile Service (protected)
                .route("profile-service", r -> r
                        .path("/api/profiles/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://PROFILE-SERVICE"))
                
                // Product Service - All GET requests public (listing, search, featured, filter, by-id)
                .route("product-service-public", r -> r
                        .path("/api/products", "/api/products/**")
                        .and().method("GET")
                        .uri("lb://PRODUCT-SERVICE"))
                
                // Product Service - POST/PUT/DELETE protected (require auth + role check in product service)
                .route("product-service-protected", r -> r
                        .path("/api/products", "/api/products/**")
                        .and().method("POST", "PUT", "DELETE")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://PRODUCT-SERVICE"))
                
                // Cart Service (protected - user specific)
                .route("cart-service", r -> r
                        .path("/api/carts/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://CART-SERVICE"))
                
                // Order Service (protected)
                .route("order-service", r -> r
                        .path("/api/orders/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://ORDER-SERVICE"))
                
                // Wallet Service (protected)
                .route("wallet-service", r -> r
                        .path("/api/wallets/**")
                        .filters(f -> f.filter(authenticationFilter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://WALLET-SERVICE"))
                
                .build();
    }
}