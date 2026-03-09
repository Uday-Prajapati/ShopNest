package com.shopnest.profile_service.service;

import com.shopnest.profile_service.dto.AddressDTO;
import com.shopnest.profile_service.dto.ProfileCreateRequest;
import com.shopnest.profile_service.dto.UserProfileDTO;
import com.shopnest.profile_service.entity.Address;
import com.shopnest.profile_service.entity.UserProfile;
import com.shopnest.profile_service.exception.ProfileNotFoundException;
import com.shopnest.profile_service.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileServiceImpl implements ProfileService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Override
    @Transactional
    public UserProfileDTO createProfile(ProfileCreateRequest request) {
        // Check if profile already exists
        if (profileRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Profile already exists with username: " + request.getUsername());
        }
        
        if (profileRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Profile already exists with email: " + request.getEmail());
        }
        
        UserProfile profile = new UserProfile();
        profile.setUsername(request.getUsername());
        profile.setEmail(request.getEmail());
        profile.setFullName(request.getFullName());
        profile.setMobileNumber(request.getMobileNumber());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setRole(request.getRole());
        profile.setActive(true);
        
        UserProfile savedProfile = profileRepository.save(profile);
        return mapToDTO(savedProfile);
    }
    
    @Override
    public UserProfileDTO getProfileById(Long id) {
        UserProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));
        return mapToDTO(profile);
    }
    
    @Override
    public UserProfileDTO getProfileByUsername(String username) {
        UserProfile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with username: " + username));
        return mapToDTO(profile);
    }
    
    @Override
    public UserProfileDTO getProfileByEmail(String email) {
        UserProfile profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with email: " + email));
        return mapToDTO(profile);
    }
    
    @Override
    public List<UserProfileDTO> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<UserProfileDTO> getProfilesByRole(String role) {
        return profileRepository.findByRole(role).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public UserProfileDTO updateProfile(Long id, UserProfileDTO profileDTO) {
        UserProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + id));
        
        // Update fields
        if (profileDTO.getFullName() != null) {
            profile.setFullName(profileDTO.getFullName());
        }
        if (profileDTO.getMobileNumber() != null) {
            profile.setMobileNumber(profileDTO.getMobileNumber());
        }
        if (profileDTO.getGender() != null) {
            profile.setGender(profileDTO.getGender());
        }
        if (profileDTO.getDateOfBirth() != null) {
            profile.setDateOfBirth(profileDTO.getDateOfBirth());
        }
        if (profileDTO.getProfilePicture() != null) {
            profile.setProfilePicture(profileDTO.getProfilePicture());
        }
        
        UserProfile updatedProfile = profileRepository.save(profile);
        return mapToDTO(updatedProfile);
    }
    
    @Override
    @Transactional
    public void deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ProfileNotFoundException("Profile not found with id: " + id);
        }
        profileRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public UserProfileDTO addAddress(Long profileId, AddressDTO addressDTO) {
        UserProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + profileId));
        
        Address address = mapToAddressEntity(addressDTO);
        profile.addAddress(address);
        
        UserProfile updatedProfile = profileRepository.save(profile);
        return mapToDTO(updatedProfile);
    }
    
    @Override
    @Transactional
    public UserProfileDTO updateAddress(Long profileId, Long addressId, AddressDTO addressDTO) {
        UserProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + profileId));
        
        Address address = profile.getAddresses().stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));
        
        // Update address fields
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostalCode());
        address.setCountry(addressDTO.getCountry());
        address.setAddressType(addressDTO.getAddressType());
        address.setDefault(addressDTO.isDefault());
        
        UserProfile updatedProfile = profileRepository.save(profile);
        return mapToDTO(updatedProfile);
    }
    
    @Override
    @Transactional
    public void deleteAddress(Long profileId, Long addressId) {
        UserProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with id: " + profileId));
        
        Address address = profile.getAddresses().stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));
        
        profile.removeAddress(address);
        profileRepository.save(profile);
    }
    
    @Override
    public List<UserProfileDTO> searchProfiles(String searchTerm) {
        return profileRepository.searchProfiles(searchTerm).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean existsByUsername(String username) {
        return profileRepository.existsByUsername(username);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return profileRepository.existsByEmail(email);
    }
    
    // Mapping methods
    private UserProfileDTO mapToDTO(UserProfile profile) {
        return UserProfileDTO.builder()
                .id(profile.getId())
                .username(profile.getUsername())
                .email(profile.getEmail())
                .fullName(profile.getFullName())
                .mobileNumber(profile.getMobileNumber())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth())
                .profilePicture(profile.getProfilePicture())
                .addresses(profile.getAddresses().stream()
                        .map(this::mapAddressToDTO)
                        .collect(Collectors.toList()))
                .role(profile.getRole())
                .isActive(profile.isActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
    
    private AddressDTO mapAddressToDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .addressType(address.getAddressType())
                .isDefault(address.isDefault())
                .build();
    }
    
    private Address mapToAddressEntity(AddressDTO addressDTO) {
        Address address = new Address();
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostalCode());
        address.setCountry(addressDTO.getCountry());
        address.setAddressType(addressDTO.getAddressType());
        address.setDefault(addressDTO.isDefault());
        return address;
    }
}