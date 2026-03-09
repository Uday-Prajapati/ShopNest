package com.shopnest.auth_service.service;

import com.shopnest.auth_service.dto.LoginRequest;
import com.shopnest.auth_service.dto.LoginResponse;
import com.shopnest.auth_service.dto.RegisterRequest;
import com.shopnest.auth_service.dto.UserDto;

public interface AuthService {
    LoginResponse authenticateUser(LoginRequest loginRequest);
    UserDto registerUser(RegisterRequest registerRequest);
    Boolean validateToken(String token);
    UserDto getCurrentUser(String token);
}