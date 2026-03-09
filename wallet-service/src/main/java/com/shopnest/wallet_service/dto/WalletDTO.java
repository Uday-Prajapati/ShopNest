package com.shopnest.wallet_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletDTO {
    private Long id;
    private String userId;
    private Long profileId;
    private Double balance;
    private String currency;
    private Boolean isActive;
    private List<TransactionDTO> recentTransactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}