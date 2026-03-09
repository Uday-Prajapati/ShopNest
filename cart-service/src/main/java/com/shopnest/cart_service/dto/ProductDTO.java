package com.shopnest.cart_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String id;
    private String productCode;
    private String name;
    private Double price;
    private String description;
    private String category;
    private List<String> images;
    private Integer stockQuantity;
}