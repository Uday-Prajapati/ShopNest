package com.shopnest.order_service.service;

import com.shopnest.order_service.dto.OrderRequestDTO;
import com.shopnest.order_service.dto.OrderResponseDTO;
import com.shopnest.order_service.dto.ReturnRequestDTO;
import com.shopnest.order_service.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    
    OrderResponseDTO createOrder(OrderRequestDTO orderRequest);
    
    OrderResponseDTO getOrderById(Long id);
    
    OrderResponseDTO getOrderByNumber(String orderNumber);
    
    List<OrderResponseDTO> getOrdersByUser(String userId);
    
    Page<OrderResponseDTO> getOrdersByUserPaginated(String userId, Pageable pageable);
    
    List<OrderResponseDTO> getOrdersByStatus(OrderStatus status);
    
    OrderResponseDTO updateOrderStatus(Long id, OrderStatus status);
    
    OrderResponseDTO cancelOrder(Long id, String reason, String username, String rolesHeader);
    
    OrderResponseDTO processPayment(Long id, String paymentMethod, String username, String rolesHeader);
    
    List<OrderResponseDTO> getUserOrderHistory(String userId);
    
    Double getUserTotalSpent(String userId);
    
    Long getUserOrderCount(String userId);

    Double getTodayDeliveryEarnings();

    OrderResponseDTO requestReturn(ReturnRequestDTO request, String username);
}