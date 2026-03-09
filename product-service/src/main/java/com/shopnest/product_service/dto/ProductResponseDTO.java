package com.shopnest.product_service.dto;

import com.shopnest.product_service.entity.Review;
import com.shopnest.product_service.entity.Specification;
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
public class ProductResponseDTO {
    private String id;
    private String productCode;
    private String name;
    private String description;
    private String category;
    private String categoryId;
    private Double price;
    private Double discountedPrice;
    private Integer stockQuantity;
    private List<String> images;
    private Specification specifications;
    private List<Review> reviews;
    private Double averageRating;
    private Integer totalReviews;
    private String brand;
    private List<String> tags;
    private Boolean isAvailable;
    private Boolean isFeatured;
    private Integer soldCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}