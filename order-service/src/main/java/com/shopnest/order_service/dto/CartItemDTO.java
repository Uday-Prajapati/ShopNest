package com.shopnest.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private String productId;
    private String productName;
    private Double price;
    private Integer quantity;
    private String imageUrl;
    private Double subtotal;
}

