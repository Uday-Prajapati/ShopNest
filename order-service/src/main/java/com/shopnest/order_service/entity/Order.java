package com.shopnest.order_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String orderNumber; // Format: ORD-2024-001
    
    private String userId; // Username from auth service
    
    private Long profileId; // Profile ID from profile service
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();
    
    private Double subtotal;
    private Double tax;
    private Double shippingCharge;
    private Double discount;
    private Double totalAmount;
    
    private String shippingAddress;
    private String billingAddress;
    private String phoneNumber;
    private String email;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    private String paymentMethod; // WALLET, COD, CARD, UPI
    private String paymentStatus; // PENDING, COMPLETED, FAILED, REFUNDED
    private String transactionId;
    
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime cancelledDate;
    
    private String cancellationReason;
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        orderDate = LocalDateTime.now();
        if (orderNumber == null) {
            generateOrderNumber();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private void generateOrderNumber() {
        // Format: ORD-YYYY-XXXXX
        String year = String.valueOf(LocalDateTime.now().getYear());
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.orderNumber = "ORD-" + year + "-" + random;
    }
    
    public void calculateTotals() {
        this.subtotal = items.stream()
                .mapToDouble(OrderItem::getSubtotal)
                .sum();
        this.totalAmount = this.subtotal + (tax != null ? tax : 0) 
                + (shippingCharge != null ? shippingCharge : 0) 
                - (discount != null ? discount : 0);
    }
    
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        calculateTotals();
    }
}