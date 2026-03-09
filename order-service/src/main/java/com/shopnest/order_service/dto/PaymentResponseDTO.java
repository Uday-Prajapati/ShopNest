package com.shopnest.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Boolean success;
    private String transactionId;
    private Double amount;
    private Double newBalance;
    private String message;
    private String orderNumber;
}
