package com.shopnest.order_service.client;

import com.shopnest.order_service.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", url = "${product.service.url}")
public interface ProductServiceClient {
    
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") String id);
    
    @GetMapping("/api/products/{id}/availability")
    Boolean checkAvailability(@PathVariable("id") String id, @RequestParam("quantity") Integer quantity);
    
    @PutMapping("/api/products/{id}/stock")
    void updateStock(@PathVariable("id") String id, @RequestParam("quantity") Integer quantity);
}