package com.shopnest.cart_service.client;

import com.shopnest.cart_service.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "${product.service.url}")
public interface ProductServiceClient {
    
    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") String id);
    
    @GetMapping("/api/products/{id}/stock")
    Integer checkStock(@PathVariable("id") Long id);
}