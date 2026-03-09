package com.shopnest.wallet_service.repository;

import com.shopnest.wallet_service.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    Optional<Wallet> findByUserId(String userId);
    
    Optional<Wallet> findByProfileId(Long profileId);
    
    @Query("SELECT w.balance FROM Wallet w WHERE w.userId = :userId")
    Double getBalanceByUserId(@Param("userId") String userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance + :amount WHERE w.userId = :userId")
    int addMoney(@Param("userId") String userId, @Param("amount") Double amount);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance - :amount WHERE w.userId = :userId AND w.balance >= :amount")
    int deductMoney(@Param("userId") String userId, @Param("amount") Double amount);
    
    boolean existsByUserId(String userId);
}