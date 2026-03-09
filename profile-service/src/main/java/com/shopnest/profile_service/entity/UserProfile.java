package com.shopnest.profile_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username; // Same as auth service username
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String fullName;
    private String mobileNumber;
    private String gender;
    private LocalDateTime dateOfBirth;
    private String profilePicture;
    
    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Address> addresses = new ArrayList<>();
    
    private String role; // CUSTOMER, MERCHANT, DELIVERY_AGENT
    
    private boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods for bidirectional relationship
    public void addAddress(Address address) {
        addresses.add(address);
        address.setUserProfile(this);
    }
    
    public void removeAddress(Address address) {
        addresses.remove(address);
        address.setUserProfile(null);
    }
}