package com.shopnest.profile_service.service;

import com.shopnest.profile_service.dto.AddressDTO;
import com.shopnest.profile_service.dto.ProfileCreateRequest;
import com.shopnest.profile_service.dto.UserProfileDTO;

import java.util.List;

public interface ProfileService {
    
    UserProfileDTO createProfile(ProfileCreateRequest request);
    
    UserProfileDTO getProfileById(Long id);
    
    UserProfileDTO getProfileByUsername(String username);
    
    UserProfileDTO getProfileByEmail(String email);
    
    List<UserProfileDTO> getAllProfiles();
    
    List<UserProfileDTO> getProfilesByRole(String role);
    
    UserProfileDTO updateProfile(Long id, UserProfileDTO profileDTO);
    
    void deleteProfile(Long id);
    
    UserProfileDTO addAddress(Long profileId, AddressDTO addressDTO);
    
    UserProfileDTO updateAddress(Long profileId, Long addressId, AddressDTO addressDTO);
    
    void deleteAddress(Long profileId, Long addressId);
    
    List<UserProfileDTO> searchProfiles(String searchTerm);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}