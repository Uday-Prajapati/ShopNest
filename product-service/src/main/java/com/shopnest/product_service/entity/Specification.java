package com.shopnest.product_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Specification {
    private String brand;
    private String model;
    private String color;
    private String size;
    private String weight;
    private String material;
    private Map<String, String> additionalSpecs;
}