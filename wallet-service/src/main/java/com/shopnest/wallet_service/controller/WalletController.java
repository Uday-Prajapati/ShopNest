package com.shopnest.wallet_service.controller;

import com.shopnest.wallet_service.dto.*;
import com.shopnest.wallet_service.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {
    
    private final WalletService walletService;
    
    // Create new wallet
    @PostMapping("/user/{userId}")
    public ResponseEntity<WalletDTO> createWallet(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        WalletDTO wallet = walletService.createWallet(userId);
        return new ResponseEntity<>(wallet, HttpStatus.CREATED);
    }
    
    // Get wallet by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<WalletDTO> getWalletByUserId(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        WalletDTO wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(wallet);
    }
    
    // Get wallet by ID
    @GetMapping("/{id}")
    public ResponseEntity<WalletDTO> getWalletById(@PathVariable Long id) {
        WalletDTO wallet = walletService.getWalletById(id);
        return ResponseEntity.ok(wallet);
    }
    
    // Get wallet balance
    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<Double> getBalance(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double balance = walletService.getBalance(userId);
        return ResponseEntity.ok(balance);
    }
    
    // Add money to wallet
    @PostMapping("/add-money")
    public ResponseEntity<WalletDTO> addMoney(@Valid @RequestBody AddMoneyRequestDTO request) {
        WalletDTO updatedWallet = walletService.addMoney(request);
        return ResponseEntity.ok(updatedWallet);
    }
    
    // Process payment (deduct money)
    @PostMapping("/pay")
    public ResponseEntity<PaymentResponseDTO> processPayment(@Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = walletService.processPayment(request);
        return ResponseEntity.ok(response);
    }
    
    // Process refund
    @PostMapping("/refund")
    public ResponseEntity<PaymentResponseDTO> refundPayment(
            @RequestParam String orderNumber,
            @RequestParam Double amount,
            @RequestParam String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        PaymentResponseDTO response = walletService.refundPayment(orderNumber, amount, userId);
        return ResponseEntity.ok(response);
    }
    
    // Get transaction history
    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactionHistory(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<TransactionDTO> transactions = walletService.getTransactionHistory(userId);
        return ResponseEntity.ok(transactions);
    }
    
    // Get transaction history with pagination
    @GetMapping("/user/{userId}/transactions/paginated")
    public ResponseEntity<Page<TransactionDTO>> getTransactionHistoryPaginated(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        Sort sort = direction.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TransactionDTO> transactions = walletService.getTransactionHistoryPaginated(userId, pageable);
        return ResponseEntity.ok(transactions);
    }
    
    // Get transactions by date range
    @GetMapping("/user/{userId}/transactions/date-range")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByDateRange(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<TransactionDTO> transactions = walletService.getTransactionsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    // Get total credits
    @GetMapping("/user/{userId}/stats/credits")
    public ResponseEntity<Double> getTotalCredits(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double totalCredits = walletService.getTotalCredits(userId);
        return ResponseEntity.ok(totalCredits);
    }
    
    // Get total debits
    @GetMapping("/user/{userId}/stats/debits")
    public ResponseEntity<Double> getTotalDebits(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double totalDebits = walletService.getTotalDebits(userId);
        return ResponseEntity.ok(totalDebits);
    }

    // Combined stats (credits + debits) for convenience
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<WalletStatsDTO> getWalletStats(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double credits = walletService.getTotalCredits(userId);
        Double debits = walletService.getTotalDebits(userId);
        WalletStatsDTO stats = new WalletStatsDTO(
                credits != null ? credits : 0.0,
                debits != null ? debits : 0.0
        );
        return ResponseEntity.ok(stats);
    }
    
    // Deactivate wallet
    @PatchMapping("/user/{userId}/deactivate")
    public ResponseEntity<Void> deactivateWallet(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        walletService.deactivateWallet(userId);
        return ResponseEntity.noContent().build();
    }
    
    // Activate wallet
    @PatchMapping("/user/{userId}/activate")
    public ResponseEntity<Void> activateWallet(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        walletService.activateWallet(userId);
        return ResponseEntity.noContent().build();
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Wallet Service is up and running!");
    }
}