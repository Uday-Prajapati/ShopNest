package com.shopnest.order_service.service;

import com.shopnest.order_service.client.CartServiceClient;
import com.shopnest.order_service.client.ProductServiceClient;
import com.shopnest.order_service.client.ProfileServiceClient;
import com.shopnest.order_service.client.WalletServiceClient;
import com.shopnest.order_service.dto.*;
import com.shopnest.order_service.entity.Order;
import com.shopnest.order_service.entity.OrderItem;
import com.shopnest.order_service.entity.OrderStatus;
import com.shopnest.order_service.exception.OrderNotFoundException;
import com.shopnest.order_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartServiceClient cartServiceClient;
    
    @Autowired
    private ProductServiceClient productServiceClient;
    
    @Autowired
    private ProfileServiceClient profileServiceClient;
    
    @Autowired
    private WalletServiceClient walletServiceClient;
    
    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO orderRequest) {
        
        // 1. Get user profile
        UserProfileDTO profile = profileServiceClient.getProfileByUsername(orderRequest.getUserId());
        
        // 2. Get active cart
        CartDTO cart = cartServiceClient.getActiveCart(orderRequest.getUserId());
        
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot create order with empty cart");
        }
        
        // 3. Validate stock availability for all items
        for (CartItemDTO cartItem : cart.getItems()) {
            Boolean available = productServiceClient.checkAvailability(
                cartItem.getProductId(), 
                cartItem.getQuantity()
            );
            if (!available) {
                throw new IllegalStateException("Product " + cartItem.getProductName() + " is out of stock");
            }
        }
        
        // 4. Create order
        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setProfileId(profile.getId());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setPhoneNumber(orderRequest.getPhoneNumber());
        order.setEmail(profile.getEmail());
        order.setNotes(orderRequest.getNotes());
        
        // Set addresses
        if (orderRequest.getShippingAddress() != null) {
            order.setShippingAddress(orderRequest.getShippingAddress());
        } else if (profile.getAddresses() != null && !profile.getAddresses().isEmpty()) {
            // Use default address
            AddressDTO defaultAddress = profile.getAddresses().stream()
                    .filter(AddressDTO::isDefault)
                    .findFirst()
                    .orElse(profile.getAddresses().get(0));
            
            String addressStr = String.format("%s, %s, %s - %s, %s",
                defaultAddress.getAddressLine1(),
                defaultAddress.getCity(),
                defaultAddress.getState(),
                defaultAddress.getPostalCode(),
                defaultAddress.getCountry());
            
            order.setShippingAddress(addressStr);
            order.setBillingAddress(addressStr);
        }
        
        // 5. Add items to order
        for (CartItemDTO cartItem : cart.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(cartItem.getProductId());
            item.setProductName(cartItem.getProductName());
            item.setPrice(cartItem.getPrice());
            item.setQuantity(cartItem.getQuantity());
            item.setSubtotal(cartItem.getSubtotal());
            item.setImageUrl(cartItem.getImageUrl());
            
            // Get product code from product service
            ProductDTO product = productServiceClient.getProductById(cartItem.getProductId());
            item.setProductCode(product.getProductCode());
            
            order.addItem(item);
            
            // Update stock in product service
            productServiceClient.updateStock(cartItem.getProductId(), cartItem.getQuantity());
        }
        
        // 6. Calculate totals
        order.setTax(order.getSubtotal() * 0.05); // 5% tax
        order.setShippingCharge(40.0); // Fixed shipping
        order.setDiscount(0.0);
        order.calculateTotals();
        
        // 7. Process payment based on method
        if ("WALLET".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            processWalletPayment(order);
        } else if ("COD".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            order.setPaymentStatus("PENDING");
            order.setStatus(OrderStatus.CONFIRMED);
        }
        
        // 8. Save order
        Order savedOrder = orderRepository.save(order);
        
        // 9. Checkout cart (clear it)
        cartServiceClient.checkoutCart(orderRequest.getUserId());
        
        return mapToDTO(savedOrder);
    }
    
    private void processWalletPayment(Order order) {
        PaymentRequestDTO paymentRequest = PaymentRequestDTO.builder()
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .orderNumber(order.getOrderNumber())
                .paymentMethod("WALLET")
                .build();
        
        PaymentResponseDTO paymentResponse = walletServiceClient.processPayment(paymentRequest);
        boolean paymentSuccess = paymentResponse != null && Boolean.TRUE.equals(paymentResponse.getSuccess());
        
        if (paymentSuccess) {
            order.setPaymentStatus("COMPLETED");
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setPaymentStatus("FAILED");
            order.setStatus(OrderStatus.PENDING);
            throw new IllegalStateException("Payment failed - insufficient balance");
        }
    }
    
    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        return mapToDTO(order);
    }
    
    @Override
    public OrderResponseDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with number: " + orderNumber));
        return mapToDTO(order);
    }
    
    @Override
    public List<OrderResponseDTO> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<OrderResponseDTO> getOrdersByUserPaginated(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToDTO);
    }
    
    @Override
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        
        order.setStatus(status);
        
        if (status == OrderStatus.DELIVERED) {
            order.setDeliveryDate(LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        return mapToDTO(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(Long id, String reason, String username, String rolesHeader) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));

        // Only order owner or admin can cancel
        if (!isOwnerOrAdmin(order.getUserId(), username, rolesHeader)) {
            throw new IllegalStateException("Not authorized to cancel this order");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel delivered order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledDate(LocalDateTime.now());
        order.setCancellationReason(reason);
        
        // TODO: Process refund if payment was made
        
        Order updatedOrder = orderRepository.save(order);
        return mapToDTO(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponseDTO processPayment(Long id, String paymentMethod, String username, String rolesHeader) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));

        // Only order owner or admin can process payment
        if (!isOwnerOrAdmin(order.getUserId(), username, rolesHeader)) {
            throw new IllegalStateException("Not authorized to process payment for this order");
        }
        order.setPaymentMethod(paymentMethod);
        
        if ("WALLET".equalsIgnoreCase(paymentMethod)) {
            processWalletPayment(order);
        }
        
        Order updatedOrder = orderRepository.save(order);
        return mapToDTO(updatedOrder);
    }
    
    @Override
    public List<OrderResponseDTO> getUserOrderHistory(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED 
                        || order.getStatus() == OrderStatus.CANCELLED)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Double getUserTotalSpent(String userId) {
        Double total = orderRepository.getTotalSpentByUser(userId);
        return total != null ? total : 0.0;
    }
    
    @Override
    public Long getUserOrderCount(String userId) {
        return orderRepository.countOrdersByUserId(userId);
    }

    @Override
    public Double getTodayDeliveryEarnings() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        Double totalDelivered = orderRepository.getTotalDeliveredAmountBetween(start, end);
        double total = totalDelivered != null ? totalDelivered : 0.0;
        // Assume delivery agent earns 5% of delivered order amounts
        return total * 0.05;
    }

    @Override
    @Transactional
    public OrderResponseDTO requestReturn(ReturnRequestDTO request, String username) {
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Invalid return request");
        }
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + request.getOrderId()));

        // Only order owner or admin can request return
        if (!isOwnerOrAdmin(order.getUserId(), username, null)) {
            throw new IllegalStateException("Not authorized to request return for this order");
        }

        // Simple implementation: mark order as RETURNED and rely on future wallet refund logic
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only delivered orders can be returned");
        }
        order.setStatus(OrderStatus.RETURNED);
        order.setNotes("Return requested: " + (request.getReason() != null ? request.getReason() : ""));

        Order updated = orderRepository.save(order);
        return mapToDTO(updated);
    }
    
    private OrderResponseDTO mapToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .productId(item.getProductId())
                        .productCode(item.getProductCode())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .imageUrl(item.getImageUrl())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .profileId(order.getProfileId())
                .items(itemDTOs)
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCharge(order.getShippingCharge())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .phoneNumber(order.getPhoneNumber())
                .email(order.getEmail())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .transactionId(order.getTransactionId())
                .orderDate(order.getOrderDate())
                .deliveryDate(order.getDeliveryDate())
                .cancelledDate(order.getCancelledDate())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private boolean isOwnerOrAdmin(String orderUserId, String username, String rolesHeader) {
        if (orderUserId != null && orderUserId.equals(username)) {
            return true;
        }
        if (rolesHeader == null || rolesHeader.isEmpty()) {
            return false;
        }
        return rolesHeader.contains("ROLE_ADMIN");
    }
}