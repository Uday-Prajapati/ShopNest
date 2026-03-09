package com.shopnest.wallet_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderServiceClient {
    
    @PostMapping("/api/orders/{orderNumber}/refund")
    void processRefund(@PathVariable("orderNumber") String orderNumber, @RequestParam("amount") Double amount);
}