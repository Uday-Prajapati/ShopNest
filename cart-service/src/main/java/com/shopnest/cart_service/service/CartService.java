package com.shopnest.cart_service.service;

import com.shopnest.cart_service.dto.AddToCartRequest;
import com.shopnest.cart_service.dto.CartDTO;
import com.shopnest.cart_service.dto.UpdateCartItemRequest;

public interface CartService {
    
    CartDTO getCartByUserId(String userId);
    
    CartDTO getActiveCart(String userId);
    
    CartDTO addItemToCart(String userId, AddToCartRequest request);
    
    CartDTO updateCartItem(String userId, Long itemId, UpdateCartItemRequest request);
    
    CartDTO removeItemFromCart(String userId, Long itemId);
    
    CartDTO clearCart(String userId);
    
    CartDTO checkoutCart(String userId);
    
    void deleteCart(Long cartId);
    
    Double getCartTotal(String userId);
}