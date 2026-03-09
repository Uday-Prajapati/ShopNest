package com.shopnest.wallet_service.service;

import com.shopnest.wallet_service.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface WalletService {
    
    WalletDTO createWallet(String userId);
    
    WalletDTO getWalletByUserId(String userId);
    
    WalletDTO getWalletById(Long id);
    
    WalletDTO addMoney(AddMoneyRequestDTO request);
    
    PaymentResponseDTO processPayment(PaymentRequestDTO request);
    
    PaymentResponseDTO refundPayment(String orderNumber, Double amount, String userId);
    
    Double getBalance(String userId);
    
    List<TransactionDTO> getTransactionHistory(String userId);
    
    Page<TransactionDTO> getTransactionHistoryPaginated(String userId, Pageable pageable);
    
    List<TransactionDTO> getTransactionsByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate);
    
    Double getTotalCredits(String userId);
    
    Double getTotalDebits(String userId);
    
    void deactivateWallet(String userId);
    
    void activateWallet(String userId);
}