package com.shopnest.order_service.repository;

import com.shopnest.order_service.entity.Order;
import com.shopnest.order_service.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByUserId(String userId);
    
    Page<Order> findByUserId(String userId, Pageable pageable);
    
    List<Order> findByUserIdAndStatus(String userId, OrderStatus status);
    
    List<Order> findByStatus(OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByUserIdAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = :paymentStatus")
    List<Order> findByPaymentStatus(@Param("paymentStatus") String paymentStatus);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Long countOrdersByUserId(@Param("userId") String userId);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.userId = :userId AND o.status = 'DELIVERED'")
    Double getTotalSpentByUser(@Param("userId") String userId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' AND o.deliveryDate BETWEEN :startDate AND :endDate")
    Double getTotalDeliveredAmountBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}