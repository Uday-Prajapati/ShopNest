package com.shopnest.product_service.dto;

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
    private String description;
    private String category;
    private Double price;
    private Double discountedPrice;
    private List<String> images;
    private Double averageRating;
    private Integer totalReviews;
    private String brand;
    private Boolean isAvailable;
}