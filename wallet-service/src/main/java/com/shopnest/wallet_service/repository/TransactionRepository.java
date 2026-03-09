package com.shopnest.wallet_service.repository;

import com.shopnest.wallet_service.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByWalletUserId(String userId);
    
    Page<Transaction> findByWalletUserId(String userId, Pageable pageable);
    
    List<Transaction> findByWalletUserIdAndCreatedAtBetween(
            String userId, 
            LocalDateTime startDate, 
            LocalDateTime endDate);
    
    List<Transaction> findByOrderNumber(String orderNumber);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.wallet.userId = :userId AND t.type = 'CREDIT'")
    Double getTotalCredits(@Param("userId") String userId);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.wallet.userId = :userId AND t.type = 'DEBIT'")
    Double getTotalDebits(@Param("userId") String userId);
    
    @Query("SELECT t FROM Transaction t WHERE t.wallet.userId = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findRecentTransactions(@Param("userId") String userId, Pageable pageable);
}