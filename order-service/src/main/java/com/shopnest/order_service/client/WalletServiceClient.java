package com.shopnest.order_service.client;

import com.shopnest.order_service.dto.PaymentRequestDTO;
import com.shopnest.order_service.dto.PaymentResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "wallet-service", url = "${wallet.service.url}")
public interface WalletServiceClient {
    
    @PostMapping("/api/wallets/pay")
    PaymentResponseDTO processPayment(@RequestBody PaymentRequestDTO paymentRequest);
}