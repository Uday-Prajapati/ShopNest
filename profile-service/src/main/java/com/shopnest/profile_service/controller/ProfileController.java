package com.shopnest.profile_service.controller;

import com.shopnest.profile_service.dto.AddressDTO;
import com.shopnest.profile_service.dto.ProfileCreateRequest;
import com.shopnest.profile_service.dto.UserProfileDTO;
import com.shopnest.profile_service.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    // Create new profile
    @PostMapping
    public ResponseEntity<UserProfileDTO> createProfile(@Valid @RequestBody ProfileCreateRequest request) {
        UserProfileDTO createdProfile = profileService.createProfile(request);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }
    
    // Get all profiles
    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllProfiles(
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<UserProfileDTO> profiles = profileService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }
    
    // Get profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfileById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!canAccessProfile(id, username, rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO profile = profileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }
    
    // Get profile by username
    @GetMapping("/username/{username}")
    public ResponseEntity<UserProfileDTO> getProfileByUsername(
            @PathVariable String username,
            @RequestHeader(value = "X-Auth-Username", required = false) String currentUsername,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!username.equals(currentUsername) && !isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO profile = profileService.getProfileByUsername(username);
        return ResponseEntity.ok(profile);
    }
    
    // Get profile by email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserProfileDTO> getProfileByEmail(
            @PathVariable String email,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO profile = profileService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }
    
    // Get profiles by role
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserProfileDTO>> getProfilesByRole(
            @PathVariable String role,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<UserProfileDTO> profiles = profileService.getProfilesByRole(role);
        return ResponseEntity.ok(profiles);
    }
    
    // Update profile
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserProfileDTO profileDTO,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!canAccessProfile(id, username, rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO updatedProfile = profileService.updateProfile(id, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }
    
    // Delete profile
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
    
    // Add address to profile
    @PostMapping("/{profileId}/addresses")
    public ResponseEntity<UserProfileDTO> addAddress(
            @PathVariable Long profileId,
            @Valid @RequestBody AddressDTO addressDTO,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!canAccessProfile(profileId, username, rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO updatedProfile = profileService.addAddress(profileId, addressDTO);
        return new ResponseEntity<>(updatedProfile, HttpStatus.CREATED);
    }
    
    // Update address
    @PutMapping("/{profileId}/addresses/{addressId}")
    public ResponseEntity<UserProfileDTO> updateAddress(
            @PathVariable Long profileId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressDTO addressDTO,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!canAccessProfile(profileId, username, rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserProfileDTO updatedProfile = profileService.updateAddress(profileId, addressId, addressDTO);
        return ResponseEntity.ok(updatedProfile);
    }
    
    // Delete address
    @DeleteMapping("/{profileId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long profileId,
            @PathVariable Long addressId,
            @RequestHeader(value = "X-Auth-Username", required = false) String username,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!canAccessProfile(profileId, username, rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        profileService.deleteAddress(profileId, addressId);
        return ResponseEntity.noContent().build();
    }
    
    // Search profiles
    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchProfiles(
            @RequestParam String q,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        if (!isAdmin(rolesHeader)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<UserProfileDTO> profiles = profileService.searchProfiles(q);
        return ResponseEntity.ok(profiles);
    }
    
    // Check if username exists
    @GetMapping("/exists/username/{username}")
    public ResponseEntity<Boolean> existsByUsername(@PathVariable String username) {
        boolean exists = profileService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }
    
    // Check if email exists
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> existsByEmail(@PathVariable String email) {
        boolean exists = profileService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Profile Service is up and running!");
    }

    private boolean isAdmin(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isEmpty()) {
            return false;
        }
        return Arrays.stream(rolesHeader.split(","))
                .anyMatch(role -> role.trim().equals("ROLE_ADMIN"));
    }

    private boolean canAccessProfile(Long profileId, String username, String rolesHeader) {
        if (isAdmin(rolesHeader)) {
            return true;
        }
        if (username == null || username.isEmpty()) {
            return false;
        }
        try {
            UserProfileDTO profile = profileService.getProfileById(profileId);
            return username.equals(profile.getUsername());
        } catch (Exception ex) {
            return false;
        }
    }
}