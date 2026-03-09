package com.shopnest.order_service.dto;

import com.shopnest.order_service.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;
    private String userId;
    private Long profileId;
    private List<OrderItemDTO> items;
    private Double subtotal;
    private Double tax;
    private Double shippingCharge;
    private Double discount;
    private Double totalAmount;
    private String shippingAddress;
    private String billingAddress;
    private String phoneNumber;
    private String email;
    private OrderStatus status;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime cancelledDate;
    private String notes;
    private LocalDateTime createdAt;
}