package com.shopnest.wallet_service.entity;

import com.shopnest.wallet_service.exception.InsufficientBalanceException;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String userId; // Username from auth service
    
    private Long profileId; // Profile ID from profile service
    
    private Double balance = 0.0;
    
    private String currency = "INR";
    
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void addMoney(Double amount, String description) {
        Double previousBalance = this.balance;
        this.balance += amount;
        
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.CREDIT);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(previousBalance);
        transaction.setBalanceAfter(this.balance);
        transaction.setDescription(description);
        transaction.setStatus("SUCCESS");
        transaction.setWallet(this);
        
        this.transactions.add(transaction);
    }
    
    public void deductMoney(Double amount, String orderNumber, String description) {
        if (this.balance < amount) {
            throw new InsufficientBalanceException("Insufficient balance. Available: " + this.balance + ", Required: " + amount);
        }
        
        Double previousBalance = this.balance;
        this.balance -= amount;
        
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.DEBIT);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(previousBalance);
        transaction.setBalanceAfter(this.balance);
        transaction.setDescription(description);
        transaction.setOrderNumber(orderNumber);
        transaction.setStatus("SUCCESS");
        transaction.setWallet(this);
        
        this.transactions.add(transaction);
    }
    
    public void refundMoney(Double amount, String orderNumber, String description) {
        Double previousBalance = this.balance;
        this.balance += amount;
        
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.REFUND);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(previousBalance);
        transaction.setBalanceAfter(this.balance);
        transaction.setDescription(description);
        transaction.setOrderNumber(orderNumber);
        transaction.setStatus("SUCCESS");
        transaction.setWallet(this);
        
        this.transactions.add(transaction);
    }
}