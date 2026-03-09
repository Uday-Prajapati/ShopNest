package com.shopnest.product_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.shopnest.product.repository")
@EnableMongoAuditing
public class MongoConfig {
    // Additional MongoDB configuration if needed
}