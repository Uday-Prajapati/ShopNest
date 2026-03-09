package com.shopnest.profile_service.client;

import com.shopnest.profile_service.dto.AuthUserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    
    @GetMapping("/api/auth/validate")
    Boolean validateToken(@RequestHeader("Authorization") String token);
    
    @GetMapping("/api/auth/user/{username}")
    AuthUserDTO getUserByUsername(@PathVariable("username") String username);
}