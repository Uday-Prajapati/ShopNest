package com.shopnest.cart_service.repository;

import com.shopnest.cart_service.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findByUserId(String userId);
    
    Optional<Cart> findByUserIdAndStatus(String userId, String status);
    
    @Query("SELECT c FROM Cart c WHERE c.userId = :userId AND c.status = 'ACTIVE'")
    Optional<Cart> findActiveCartByUserId(@Param("userId") String userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Cart c SET c.status = 'CHECKED_OUT' WHERE c.userId = :userId AND c.status = 'ACTIVE'")
    void checkoutCart(@Param("userId") String userId);
    
    boolean existsByUserIdAndStatus(String userId, String status);
}