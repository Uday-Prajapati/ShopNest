package com.shopnest.cart_service.dto;

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
public class CartDTO {
    
    private Long id;
    private String userId;
    private List<CartItemDTO> items;
    private Double totalPrice;
    private Integer totalItems;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}