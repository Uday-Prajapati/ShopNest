package com.shopnest.wallet_service.client;

import com.shopnest.wallet_service.dto.UserProfileDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", url = "${profile.service.url}")
public interface ProfileServiceClient {
    
    @GetMapping("/api/profiles/username/{username}")
    UserProfileDTO getProfileByUsername(@PathVariable("username") String username);
}