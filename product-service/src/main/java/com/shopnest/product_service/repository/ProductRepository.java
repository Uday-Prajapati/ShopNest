package com.shopnest.product_service.repository;

import com.shopnest.product_service.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    
    Optional<Product> findByProductCode(String productCode);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByBrand(String brand);
    
    List<Product> findByIsFeaturedTrue();
    
    List<Product> findByIsAvailableTrue();
    
    @Query("{ 'price': { $gte: ?0, $lte: ?1 } }")
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
    
    @Query("{ 'averageRating': { $gte: ?0 } }")
    List<Product> findByMinimumRating(Double rating);
    
    @Query("{ 'category': ?0, 'price': { $gte: ?1, $lte: ?2 } }")
    List<Product> findByCategoryAndPriceRange(String category, Double minPrice, Double maxPrice);
    
    @Query("{ 'tags': { $in: ?0 } }")
    List<Product> findByTags(List<String> tags);
    
    @Query("{ $text: { $search: ?0 } }")
    List<Product> searchProducts(String keyword);
    
    Page<Product> findAll(Pageable pageable);
    
    boolean existsByProductCode(String productCode);
}