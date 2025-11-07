package com.healthease.service;

import com.healthease.model.User;
import com.healthease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> findByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public User updateUser(String id, User updatedUser) {
        return userRepository.findById(id)
            .map(user -> {
                if (updatedUser.getName() != null) user.setName(updatedUser.getName());
                if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
                if (updatedUser.getRole() != null) user.setRole(updatedUser.getRole());
                if (updatedUser.getPhone() != null) user.setPhone(updatedUser.getPhone());
                if (updatedUser.getDateOfBirth() != null) user.setDateOfBirth(updatedUser.getDateOfBirth());
                if (updatedUser.getAddress() != null) user.setAddress(updatedUser.getAddress());
                if (updatedUser.getSpecialization() != null) user.setSpecialization(updatedUser.getSpecialization());
                if (updatedUser.getLicenseNumber() != null) user.setLicenseNumber(updatedUser.getLicenseNumber());
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
