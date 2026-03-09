package com.shopnest.product_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String productCode;
    
    @Indexed
    private String name;
    
    private String description;
    
    @Indexed
    private String category;
    
    private String categoryId;
    
    private Double price;
    
    private Double discountedPrice;
    
    private Integer stockQuantity;
    
    private List<String> images = new ArrayList<>();
    
    private Specification specifications;
    
    private List<Review> reviews = new ArrayList<>();
    
    private Double averageRating = 0.0;
    
    private Integer totalReviews = 0;
    
    private String brand;
    
    private List<String> tags = new ArrayList<>();
    
    private Boolean isAvailable = true;
    
    private Boolean isFeatured = false;
    
    private Integer soldCount = 0;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Helper method to add review and update rating
    public void addReview(Review review) {
        reviews.add(review);
        calculateAverageRating();
    }
    
    private void calculateAverageRating() {
        if (reviews.isEmpty()) {
            averageRating = 0.0;
            totalReviews = 0;
        } else {
            totalReviews = reviews.size();
            averageRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
        }
    }
    
    public void updateStock(Integer quantity) {
        this.stockQuantity -= quantity;
        this.soldCount += quantity;
        this.isAvailable = this.stockQuantity > 0;
    }
}