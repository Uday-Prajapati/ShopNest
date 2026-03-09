package com.shopnest.product_service.service;

import com.shopnest.product_service.dto.ProductRequestDTO;
import com.shopnest.product_service.dto.ProductResponseDTO;
import com.shopnest.product_service.dto.ReviewDTO;
import com.shopnest.product_service.entity.Product;
import com.shopnest.product_service.entity.Review;
import com.shopnest.product_service.exception.ProductNotFoundException;
import com.shopnest.product_service.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO productRequest) {
        // Check if product code already exists
        if (productRepository.existsByProductCode(productRequest.getProductCode())) {
            throw new RuntimeException("Product with code " + productRequest.getProductCode() + " already exists");
        }
        
        Product product = mapToEntity(productRequest);
        Product savedProduct = productRepository.save(product);
        return mapToResponseDTO(savedProduct);
    }
    
    @Override
    public ProductResponseDTO updateProduct(String id, ProductRequestDTO productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        // Update fields
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(productRequest.getCategory());
        product.setCategoryId(productRequest.getCategoryId());
        product.setPrice(productRequest.getPrice());
        product.setDiscountedPrice(productRequest.getDiscountedPrice());
        product.setStockQuantity(productRequest.getStockQuantity());
        
        if (productRequest.getImages() != null) {
            product.setImages(productRequest.getImages());
        }
        if (productRequest.getSpecifications() != null) {
            product.setSpecifications(productRequest.getSpecifications());
        }
        product.setBrand(productRequest.getBrand());
        
        if (productRequest.getTags() != null) {
            product.setTags(productRequest.getTags());
        }
        if (productRequest.getIsFeatured() != null) {
            product.setIsFeatured(productRequest.getIsFeatured());
        }
        
        product.setIsAvailable(product.getStockQuantity() > 0);
        
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDTO(updatedProduct);
    }
    
    @Override
    public ProductResponseDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return mapToResponseDTO(product);
    }
    
    @Override
    public ProductResponseDTO getProductByCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with code: " + productCode));
        return mapToResponseDTO(product);
    }
    
    @Override
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<ProductResponseDTO> getAllProductsPaginated(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::mapToResponseDTO);
    }
    
    @Override
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
    
    @Override
    public List<ProductResponseDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> getProductsByBrand(String brand) {
        return productRepository.findByBrand(brand).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> getAvailableProducts() {
        return productRepository.findByIsAvailableTrue().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> filterByPriceRange(Double minPrice, Double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponseDTO> filterByRating(Double minRating) {
        return productRepository.findByMinimumRating(minRating).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public ProductResponseDTO addReview(String productId, ReviewDTO reviewDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        Review review = new Review(
            reviewDTO.getUserId(),
            reviewDTO.getUserName(),
            reviewDTO.getRating(),
            reviewDTO.getComment()
        );
        
        product.addReview(review);
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDTO(updatedProduct);
    }
    
    @Override
    public ProductResponseDTO updateStock(String productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.updateStock(quantity);
        Product updatedProduct = productRepository.save(product);
        return mapToResponseDTO(updatedProduct);
    }
    
    @Override
    public Boolean checkAvailability(String productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        return product.getIsAvailable() && product.getStockQuantity() >= quantity;
    }
    
    // Mapping methods
    private Product mapToEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setProductCode(dto.getProductCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setCategory(dto.getCategory());
        product.setCategoryId(dto.getCategoryId());
        product.setPrice(dto.getPrice());
        product.setDiscountedPrice(dto.getDiscountedPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImages(dto.getImages());
        product.setSpecifications(dto.getSpecifications());
        product.setBrand(dto.getBrand());
        product.setTags(dto.getTags());
        product.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        product.setIsAvailable(dto.getStockQuantity() > 0);
        return product;
    }
    
    private ProductResponseDTO mapToResponseDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .productCode(product.getProductCode())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .categoryId(product.getCategoryId())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .stockQuantity(product.getStockQuantity())
                .images(product.getImages())
                .specifications(product.getSpecifications())
                .reviews(product.getReviews())
                .averageRating(product.getAverageRating())
                .totalReviews(product.getTotalReviews())
                .brand(product.getBrand())
                .tags(product.getTags())
                .isAvailable(product.getIsAvailable())
                .isFeatured(product.getIsFeatured())
                .soldCount(product.getSoldCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}