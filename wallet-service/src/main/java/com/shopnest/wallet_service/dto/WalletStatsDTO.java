package com.shopnest.wallet_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletStatsDTO {
    private Double totalCredits;
    private Double totalDebits;
}

