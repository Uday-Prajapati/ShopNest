package com.shopnest.order_service.client;

import com.shopnest.order_service.dto.CartDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "cart-service", url = "${cart.service.url}")
public interface CartServiceClient {
    
    @GetMapping("/api/carts/user/{userId}")
    CartDTO getActiveCart(@PathVariable("userId") String userId);
    
    @PostMapping("/api/carts/user/{userId}/checkout")
    CartDTO checkoutCart(@PathVariable("userId") String userId);
}