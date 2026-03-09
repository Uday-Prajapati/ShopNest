package com.shopnest.profile_service.repository;

import com.shopnest.profile_service.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<UserProfile, Long> {
    
    Optional<UserProfile> findByUsername(String username);
    
    Optional<UserProfile> findByEmail(String email);
    
    Optional<UserProfile> findByMobileNumber(String mobileNumber);
    
    List<UserProfile> findByRole(String role);
    
    @Query("SELECT p FROM UserProfile p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.mobileNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<UserProfile> searchProfiles(@Param("searchTerm") String searchTerm);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByMobileNumber(String mobileNumber);
}