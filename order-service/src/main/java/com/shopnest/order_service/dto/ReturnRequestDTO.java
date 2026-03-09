package com.shopnest.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDTO {

    private Long orderId;
    private List<ReturnItemDTO> items;
    private String reason;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemDTO {
        private String productId;
        private Integer quantity;
    }
}

