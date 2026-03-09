package com.shopnest.wallet_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String transactionId; // Unique transaction reference
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    private Double amount;
    
    private Double balanceBefore;
    
    private Double balanceAfter;
    
    private String description;
    
    private String orderNumber; // If transaction is for an order
    
    private String paymentMethod;
    
    private String status; // SUCCESS, FAILED, PENDING
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (transactionId == null) {
            generateTransactionId();
        }
    }
    
    private void generateTransactionId() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int)(Math.random() * 10000));
        this.transactionId = "TXN" + timestamp.substring(timestamp.length() - 8) + random;
    }
}