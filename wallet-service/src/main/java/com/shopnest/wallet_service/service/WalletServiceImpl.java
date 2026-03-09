package com.shopnest.wallet_service.service;

import com.shopnest.wallet_service.client.ProfileServiceClient;
import com.shopnest.wallet_service.dto.*;
import com.shopnest.wallet_service.entity.Transaction;
import com.shopnest.wallet_service.entity.Wallet;
import com.shopnest.wallet_service.exception.InsufficientBalanceException;
import com.shopnest.wallet_service.exception.WalletNotFoundException;
import com.shopnest.wallet_service.repository.TransactionRepository;
import com.shopnest.wallet_service.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {
    
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final ProfileServiceClient profileServiceClient;
    
    @Override
    @Transactional
    public WalletDTO createWallet(String userId) {
        // Check if wallet already exists
        if (walletRepository.existsByUserId(userId)) {
            throw new RuntimeException("Wallet already exists for user: " + userId);
        }
        
        // Verify user exists
        UserProfileDTO profile = profileServiceClient.getProfileByUsername(userId);
        
        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setProfileId(profile.getId());
        wallet.setBalance(0.0);
        wallet.setIsActive(true);
        
        Wallet savedWallet = walletRepository.save(wallet);
        log.info("Wallet created for user: {}", userId);
        
        return mapToDTO(savedWallet);
    }
    
    @Override
    public WalletDTO getWalletByUserId(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + userId));
        return mapToDTO(wallet);
    }
    
    @Override
    public WalletDTO getWalletById(Long id) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found with id: " + id));
        return mapToDTO(wallet);
    }
    
    @Override
    @Transactional
    public WalletDTO addMoney(AddMoneyRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + request.getUserId()));
        
        if (!wallet.getIsActive()) {
            throw new RuntimeException("Wallet is deactivated for user: " + request.getUserId());
        }
        
        String description = request.getDescription() != null ? request.getDescription() : 
                "Added money via " + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "wallet");
        
        wallet.addMoney(request.getAmount(), description);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        log.info("Added {} to wallet for user: {}", request.getAmount(), request.getUserId());
        
        return mapToDTO(updatedWallet);
    }
    
    @Override
    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + request.getUserId()));
        
        if (!wallet.getIsActive()) {
            throw new RuntimeException("Wallet is deactivated for user: " + request.getUserId());
        }
        
        if (wallet.getBalance() < request.getAmount()) {
            throw new InsufficientBalanceException(
                String.format("Insufficient balance. Available: %.2f, Required: %.2f", 
                    wallet.getBalance(), request.getAmount())
            );
        }
        
        String description = "Payment for order " + request.getOrderNumber();
        
        wallet.deductMoney(request.getAmount(), request.getOrderNumber(), description);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        log.info("Payment of {} processed for user: {} for order: {}", 
            request.getAmount(), request.getUserId(), request.getOrderNumber());
        
        return PaymentResponseDTO.builder()
                .success(true)
                .transactionId(getLastTransaction(updatedWallet).getTransactionId())
                .amount(request.getAmount())
                .newBalance(updatedWallet.getBalance())
                .message("Payment processed successfully")
                .orderNumber(request.getOrderNumber())
                .build();
    }
    
    @Override
    @Transactional
    public PaymentResponseDTO refundPayment(String orderNumber, Double amount, String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + userId));
        
        String description = "Refund for order " + orderNumber;
        
        wallet.refundMoney(amount, orderNumber, description);
        
        Wallet updatedWallet = walletRepository.save(wallet);
        log.info("Refund of {} processed for user: {} for order: {}", amount, userId, orderNumber);
        
        return PaymentResponseDTO.builder()
                .success(true)
                .transactionId(getLastTransaction(updatedWallet).getTransactionId())
                .amount(amount)
                .newBalance(updatedWallet.getBalance())
                .message("Refund processed successfully")
                .orderNumber(orderNumber)
                .build();
    }
    
    @Override
    public Double getBalance(String userId) {
        Double balance = walletRepository.getBalanceByUserId(userId);
        if (balance == null) {
            throw new WalletNotFoundException("Wallet not found for user: " + userId);
        }
        return balance;
    }
    
    @Override
    public List<TransactionDTO> getTransactionHistory(String userId) {
        return transactionRepository.findByWalletUserId(userId).stream()
                .map(this::mapTransactionToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<TransactionDTO> getTransactionHistoryPaginated(String userId, Pageable pageable) {
        return transactionRepository.findByWalletUserId(userId, pageable)
                .map(this::mapTransactionToDTO);
    }
    
    @Override
    public List<TransactionDTO> getTransactionsByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByWalletUserIdAndCreatedAtBetween(userId, startDate, endDate).stream()
                .map(this::mapTransactionToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Double getTotalCredits(String userId) {
        Double credits = transactionRepository.getTotalCredits(userId);
        return credits != null ? credits : 0.0;
    }
    
    @Override
    public Double getTotalDebits(String userId) {
        Double debits = transactionRepository.getTotalDebits(userId);
        return debits != null ? debits : 0.0;
    }
    
    @Override
    @Transactional
    public void deactivateWallet(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + userId));
        wallet.setIsActive(false);
        walletRepository.save(wallet);
        log.info("Wallet deactivated for user: {}", userId);
    }
    
    @Override
    @Transactional
    public void activateWallet(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found for user: " + userId));
        wallet.setIsActive(true);
        walletRepository.save(wallet);
        log.info("Wallet activated for user: {}", userId);
    }
    
    private Transaction getLastTransaction(Wallet wallet) {
        return wallet.getTransactions().get(wallet.getTransactions().size() - 1);
    }
    
    private WalletDTO mapToDTO(Wallet wallet) {
        List<TransactionDTO> recentTransactions = wallet.getTransactions().stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .limit(10)
                .map(this::mapTransactionToDTO)
                .collect(Collectors.toList());
        
        return WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .profileId(wallet.getProfileId())
                .balance(wallet.getBalance())
                .currency(wallet.getCurrency())
                .isActive(wallet.getIsActive())
                .recentTransactions(recentTransactions)
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
    
    private TransactionDTO mapTransactionToDTO(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .transactionId(transaction.getTransactionId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .description(transaction.getDescription())
                .orderNumber(transaction.getOrderNumber())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}