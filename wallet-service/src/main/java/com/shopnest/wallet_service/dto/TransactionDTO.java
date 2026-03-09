package com.shopnest.wallet_service.dto;

import com.shopnest.wallet_service.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String transactionId;
    private TransactionType type;
    private Double amount;
    private Double balanceBefore;
    private Double balanceAfter;
    private String description;
    private String orderNumber;
    private String status;
    private LocalDateTime createdAt;
}