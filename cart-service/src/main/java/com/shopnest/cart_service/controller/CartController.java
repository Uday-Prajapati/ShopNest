package com.shopnest.cart_service.controller;

import com.shopnest.cart_service.dto.AddToCartRequest;
import com.shopnest.cart_service.dto.CartDTO;
import com.shopnest.cart_service.dto.UpdateCartItemRequest;
import com.shopnest.cart_service.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    // Get user's active cart
    @GetMapping("/user/{userId}")
    public ResponseEntity<CartDTO> getActiveCart(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO cart = cartService.getActiveCart(userId);
        return ResponseEntity.ok(cart);
    }
    
    // Get cart by ID
    @GetMapping("/{cartId}")
    public ResponseEntity<CartDTO> getCartById(@PathVariable Long cartId) {
        // This would need a method to get by ID - you can add if needed
        return ResponseEntity.notFound().build();
    }
    
    // Add item to cart
    @PostMapping("/user/{userId}/items")
    public ResponseEntity<CartDTO> addItemToCart(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @Valid @RequestBody AddToCartRequest request) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO updatedCart = cartService.addItemToCart(userId, request);
        return new ResponseEntity<>(updatedCart, HttpStatus.CREATED);
    }
    
    // Update cart item quantity
    @PutMapping("/user/{userId}/items/{itemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable String userId,
            @PathVariable Long itemId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @Valid @RequestBody UpdateCartItemRequest request) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO updatedCart = cartService.updateCartItem(userId, itemId, request);
        return ResponseEntity.ok(updatedCart);
    }
    
    // Remove item from cart
    @DeleteMapping("/user/{userId}/items/{itemId}")
    public ResponseEntity<CartDTO> removeItemFromCart(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @PathVariable Long itemId) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO updatedCart = cartService.removeItemFromCart(userId, itemId);
        return ResponseEntity.ok(updatedCart);
    }
    
    // Clear entire cart
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<CartDTO> clearCart(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO clearedCart = cartService.clearCart(userId);
        return ResponseEntity.ok(clearedCart);
    }
    
    // Checkout cart
    @PostMapping("/user/{userId}/checkout")
    public ResponseEntity<CartDTO> checkoutCart(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartDTO checkedOutCart = cartService.checkoutCart(userId);
        return ResponseEntity.ok(checkedOutCart);
    }
    
    // Get cart total
    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Double> getCartTotal(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double total = cartService.getCartTotal(userId);
        return ResponseEntity.ok(total);
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Cart Service is up and running!");
    }
}