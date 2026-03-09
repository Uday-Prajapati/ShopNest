package com.shopnest.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String id;
    private String productCode;
    private String name;
    private Double price;
    private Integer stockQuantity;
    private Boolean isAvailable;
}