package com.shopnest.api_gateway.filter;

import com.shopnest.api_gateway.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthenticationFilter() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // Skip authentication for public endpoints
            if (isPublicEndpoint(request.getPath().toString())) {
                return chain.filter(exchange);
            }
            
            // Check if Authorization header is present
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return handleUnauthorized(exchange, "Missing Authorization header");
            }
            
            String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            String token = extractToken(authHeader);
            
            if (token == null) {
                return handleUnauthorized(exchange, "Invalid Authorization format");
            }
            
            // Validate token
            if (!jwtUtil.validateToken(token)) {
                return handleUnauthorized(exchange, "Invalid or expired token");
            }
            
            // Extract username and roles, add to headers for downstream services
            String username = jwtUtil.getUsernameFromToken(token);
            String roles = jwtUtil.getRolesFromToken(token);
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Auth-Username", username != null ? username : "")
                    .header("X-User-Roles", roles != null ? roles : "")
                    .build();
            
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }
    
    private boolean isPublicEndpoint(String path) {
        return path.contains("/api/auth/login") ||
               path.contains("/api/auth/register") ||
               path.contains("/api/auth/validate") ||
               path.contains("/actuator") ||
               path.contains("/products") ||              // Product listing can be public
               path.contains("/products/category") ||     // Category listing can be public
               path.contains("/api/profiles/health") ||   // Profile service health
               path.contains("/api/profiles/exists/");    // Profile existence checks
    }
    
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", message);
        
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }
    
    public static class Config {
        // Configuration properties if needed
    }
}