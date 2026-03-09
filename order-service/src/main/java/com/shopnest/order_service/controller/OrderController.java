package com.shopnest.order_service.controller;

import com.shopnest.order_service.dto.OrderRequestDTO;
import com.shopnest.order_service.dto.OrderResponseDTO;
import com.shopnest.order_service.dto.ReturnRequestDTO;
import com.shopnest.order_service.entity.OrderStatus;
import com.shopnest.order_service.service.OrderService;
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
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    // Create new order
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO orderRequest) {
        OrderResponseDTO createdOrder = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }
    
    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        OrderResponseDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
    
    // Get order by order number
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponseDTO> getOrderByNumber(@PathVariable String orderNumber) {
        OrderResponseDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }
    
    // Get all orders for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUser(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<OrderResponseDTO> orders = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(orders);
    }
    
    // Get user orders with pagination
    @GetMapping("/user/{userId}/paginated")
    public ResponseEntity<Page<OrderResponseDTO>> getOrdersByUserPaginated(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        Sort sort = direction.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<OrderResponseDTO> orders = orderService.getOrdersByUserPaginated(userId, pageable);
        return ResponseEntity.ok(orders);
    }
    
    // Get orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        // Only merchants, delivery agents, or admins can view platform-wide orders by status
        if (!hasAnyRole(rolesHeader, "ROLE_MERCHANT", "ROLE_DELIVERY_AGENT", "ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<OrderResponseDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    // Update order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        // Only merchant, delivery agent, or admin can change order status
        if (!hasAnyRole(rolesHeader, "ROLE_MERCHANT", "ROLE_DELIVERY_AGENT", "ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        OrderResponseDTO updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }
    
    // Cancel order
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        OrderResponseDTO cancelledOrder = orderService.cancelOrder(id, reason, username, rolesHeader);
        return ResponseEntity.ok(cancelledOrder);
    }
    
    // Process payment for order
    @PostMapping("/{id}/payment")
    public ResponseEntity<OrderResponseDTO> processPayment(
            @PathVariable Long id,
            @RequestParam String paymentMethod,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        OrderResponseDTO order = orderService.processPayment(id, paymentMethod, username, rolesHeader);
        return ResponseEntity.ok(order);
    }
    
    // Get user order history
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<OrderResponseDTO>> getUserOrderHistory(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<OrderResponseDTO> orders = orderService.getUserOrderHistory(userId);
        return ResponseEntity.ok(orders);
    }
    
    // Get user total spent
    @GetMapping("/user/{userId}/total-spent")
    public ResponseEntity<Double> getUserTotalSpent(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double totalSpent = orderService.getUserTotalSpent(userId);
        return ResponseEntity.ok(totalSpent);
    }
    
    // Get user order count
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserOrderCount(
            @PathVariable String userId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        if (!userId.equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Long count = orderService.getUserOrderCount(userId);
        return ResponseEntity.ok(count);
    }

    // Delivery agent daily earnings (simple 5% of today's delivered orders)
    @GetMapping("/delivery/earnings/today")
    public ResponseEntity<Double> getTodayDeliveryEarnings(
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!hasAnyRole(rolesHeader, "ROLE_DELIVERY_AGENT", "ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Double earnings = orderService.getTodayDeliveryEarnings();
        return ResponseEntity.ok(earnings);
    }

    // Customer return request (to avoid 500 for Request Return flow)
    @PostMapping("/return")
    public ResponseEntity<OrderResponseDTO> requestReturn(
            @RequestBody ReturnRequestDTO request,
            @RequestHeader(value = "X-Auth-Username", required = false) String username) {
        OrderResponseDTO updated = orderService.requestReturn(request, username);
        return ResponseEntity.ok(updated);
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Order Service is up and running!");
    }

    private boolean hasAnyRole(String rolesHeader, String... roles) {
        if (rolesHeader == null || rolesHeader.isEmpty()) {
            return false;
        }
        for (String required : roles) {
            if (rolesHeader.contains(required)) {
                return true;
            }
        }
        return false;
    }
}