package com.shopnest.product_service.service;

import com.shopnest.product_service.dto.ProductRequestDTO;
import com.shopnest.product_service.dto.ProductResponseDTO;
import com.shopnest.product_service.dto.ReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    
    ProductResponseDTO createProduct(ProductRequestDTO productRequest);
    
    ProductResponseDTO updateProduct(String id, ProductRequestDTO productRequest);
    
    ProductResponseDTO getProductById(String id);
    
    ProductResponseDTO getProductByCode(String productCode);
    
    List<ProductResponseDTO> getAllProducts();
    
    Page<ProductResponseDTO> getAllProductsPaginated(Pageable pageable);
    
    void deleteProduct(String id);
    
    List<ProductResponseDTO> getProductsByCategory(String category);
    
    List<ProductResponseDTO> getProductsByBrand(String brand);
    
    List<ProductResponseDTO> getFeaturedProducts();
    
    List<ProductResponseDTO> getAvailableProducts();
    
    List<ProductResponseDTO> searchProducts(String keyword);
    
    List<ProductResponseDTO> filterByPriceRange(Double minPrice, Double maxPrice);
    
    List<ProductResponseDTO> filterByRating(Double minRating);
    
    ProductResponseDTO addReview(String productId, ReviewDTO reviewDTO);
    
    ProductResponseDTO updateStock(String productId, Integer quantity);
    
    Boolean checkAvailability(String productId, Integer quantity);
}