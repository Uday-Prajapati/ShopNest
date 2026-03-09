package com.shopnest.cart_service.service;

import com.shopnest.cart_service.client.ProductServiceClient;
import com.shopnest.cart_service.client.ProfileServiceClient;
import com.shopnest.cart_service.dto.AddToCartRequest;
import com.shopnest.cart_service.dto.CartDTO;
import com.shopnest.cart_service.dto.CartItemDTO;
import com.shopnest.cart_service.dto.ProductDTO;
import com.shopnest.cart_service.dto.UpdateCartItemRequest;
import com.shopnest.cart_service.entity.Cart;
import com.shopnest.cart_service.entity.CartItem;
import com.shopnest.cart_service.exception.CartItemNotFoundException;
import com.shopnest.cart_service.exception.CartNotFoundException;
import com.shopnest.cart_service.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductServiceClient productServiceClient;
    
    @Autowired
    private ProfileServiceClient profileServiceClient;
    
    @Override
    public CartDTO getCartByUserId(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
        return mapToDTO(cart);
    }
    
    @Override
    public CartDTO getActiveCart(String userId) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
        return mapToDTO(cart);
    }
    
    @Override
    @Transactional
    public CartDTO addItemToCart(String userId, AddToCartRequest request) {
        // Get existing cart (any status) or create a new one
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        // Reactivate cart if it is not ACTIVE
        if (cart.getStatus() == null || !"ACTIVE".equalsIgnoreCase(cart.getStatus())) {
            cart.setStatus("ACTIVE");
        }
        
        // Verify product exists and get details
        ProductDTO product = productServiceClient.getProductById(request.getProductId());
        
        // Check if product already in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);
        
        if (existingItem != null) {
            // Update quantity if product already exists
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setProductId(product.getId());
            newItem.setProductName(product.getName());
            newItem.setPrice(product.getPrice());
            newItem.setQuantity(request.getQuantity());
            String imageUrl = (product.getImages() != null && !product.getImages().isEmpty())
                    ? product.getImages().get(0) : null;
            newItem.setImageUrl(imageUrl);
            cart.addItem(newItem);
        }
        
        cart.recalculateCart();
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }
    
    @Override
    @Transactional
    public CartDTO updateCartItem(String userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("Active cart not found for user: " + userId));
        
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException("Item not found in cart"));
        
        if (request.getQuantity() == 0) {
            // Remove item if quantity is 0
            cart.removeItem(item);
        } else {
            // Update quantity
            item.setQuantity(request.getQuantity());
        }
        
        cart.recalculateCart();
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }
    
    @Override
    @Transactional
    public CartDTO removeItemFromCart(String userId, Long itemId) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("Active cart not found for user: " + userId));
        
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException("Item not found in cart"));
        
        cart.removeItem(item);
        cart.recalculateCart();
        
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }
    
    @Override
    @Transactional
    public CartDTO clearCart(String userId) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("Active cart not found for user: " + userId));
        
        cart.getItems().clear();
        cart.recalculateCart();
        
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }
    
    @Override
    @Transactional
    public CartDTO checkoutCart(String userId) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("No active cart found for user: " + userId));
        
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout empty cart");
        }
        
        cart.setStatus("CHECKED_OUT");
        cart.recalculateCart();
        
        Cart savedCart = cartRepository.save(cart);
        return mapToDTO(savedCart);
    }
    
    @Override
    @Transactional
    public void deleteCart(Long cartId) {
        if (!cartRepository.existsById(cartId)) {
            throw new CartNotFoundException("Cart not found with id: " + cartId);
        }
        cartRepository.deleteById(cartId);
    }
    
    @Override
    public Double getCartTotal(String userId) {
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException("Active cart not found for user: " + userId));
        return cart.getTotalPrice();
    }
    
    private Cart createNewCart(String userId) {
        // Verify user exists
        profileServiceClient.getProfileByUsername(userId);
        
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        newCart.setStatus("ACTIVE");
        return cartRepository.save(newCart);
    }
    
    private CartDTO mapToDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList());
        
        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .items(itemDTOs)
                .totalPrice(cart.getTotalPrice())
                .totalItems(cart.getTotalItems())
                .status(cart.getStatus())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
    
    private CartItemDTO mapItemToDTO(CartItem item) {
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .imageUrl(item.getImageUrl())
                .subtotal(item.getSubtotal())
                .build();
    }
}