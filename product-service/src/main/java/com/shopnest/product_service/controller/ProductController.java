package com.shopnest.product_service.controller;

import com.shopnest.product_service.dto.ProductRequestDTO;
import com.shopnest.product_service.dto.ProductResponseDTO;
import com.shopnest.product_service.dto.ReviewDTO;
import com.shopnest.product_service.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    // Create new product (Merchant only)
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO productRequest) {
        ProductResponseDTO createdProduct = productService.createProduct(productRequest);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }
    
    // Get all products (Public)
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }
    
    // Get products with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProductResponseDTO>> getProductsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductResponseDTO> products = productService.getAllProductsPaginated(pageable);
        return ResponseEntity.ok(products);
    }
    
    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable String id) {
        ProductResponseDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    // Get product by code
    @GetMapping("/code/{productCode}")
    public ResponseEntity<ProductResponseDTO> getProductByCode(@PathVariable String productCode) {
        ProductResponseDTO product = productService.getProductByCode(productCode);
        return ResponseEntity.ok(product);
    }
    
    // Update product
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductRequestDTO productRequest) {
        ProductResponseDTO updatedProduct = productService.updateProduct(id, productRequest);
        return ResponseEntity.ok(updatedProduct);
    }
    
    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    // Get products by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable String category) {
        List<ProductResponseDTO> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }
    
    // Get products by brand
    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByBrand(@PathVariable String brand) {
        List<ProductResponseDTO> products = productService.getProductsByBrand(brand);
        return ResponseEntity.ok(products);
    }
    
    // Get featured products
    @GetMapping("/featured")
    public ResponseEntity<List<ProductResponseDTO>> getFeaturedProducts() {
        List<ProductResponseDTO> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(products);
    }
    
    // Get available products
    @GetMapping("/available")
    public ResponseEntity<List<ProductResponseDTO>> getAvailableProducts() {
        List<ProductResponseDTO> products = productService.getAvailableProducts();
        return ResponseEntity.ok(products);
    }
    
    // Search products
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String q) {
        List<ProductResponseDTO> products = productService.searchProducts(q);
        return ResponseEntity.ok(products);
    }
    
    // Filter by price range
    @GetMapping("/filter/price")
    public ResponseEntity<List<ProductResponseDTO>> filterByPrice(
            @RequestParam Double min,
            @RequestParam Double max) {
        List<ProductResponseDTO> products = productService.filterByPriceRange(min, max);
        return ResponseEntity.ok(products);
    }
    
    // Filter by rating
    @GetMapping("/filter/rating")
    public ResponseEntity<List<ProductResponseDTO>> filterByRating(@RequestParam Double min) {
        List<ProductResponseDTO> products = productService.filterByRating(min);
        return ResponseEntity.ok(products);
    }
    
    // Add review to product
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ProductResponseDTO> addReview(
            @PathVariable String id,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        ProductResponseDTO updatedProduct = productService.addReview(id, reviewDTO);
        return new ResponseEntity<>(updatedProduct, HttpStatus.CREATED);
    }
    
    // Check product availability
    @GetMapping("/{id}/availability")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable String id,
            @RequestParam Integer quantity) {
        Boolean available = productService.checkAvailability(id, quantity);
        return ResponseEntity.ok(available);
    }
    
    // Update stock (after order)
    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductResponseDTO> updateStock(
            @PathVariable String id,
            @RequestParam Integer quantity) {
        ProductResponseDTO updatedProduct = productService.updateStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Product Service is up and running with MongoDB!");
    }
}