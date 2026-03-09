package com.shopnest.order_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    private String shippingAddress;
    private String billingAddress;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;
    
    private String email;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // WALLET, COD, CARD, UPI
    
    private String notes;
}