package com.healthease.controller;

import com.healthease.dto.AuthResponse;
import com.healthease.dto.LoginRequest;
import com.healthease.dto.RegisterRequest;
import com.healthease.model.User;
import com.healthease.security.JwtUtil;
import com.healthease.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setSpecialization(request.getSpecialization());
        user.setLicenseNumber(request.getLicenseNumber());
        
        User savedUser = userService.createUser(user);
        
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getRole().name());
        
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getRole()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new AuthResponse("User registered successfully", token, userDTO));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
            .orElseGet(() -> {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid credentials");
                throw new RuntimeException("Invalid credentials");
            });
        
        if (!userService.checkPassword(user, request.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole()
        );
        
        return ResponseEntity.ok(new AuthResponse("Login successful", token, userDTO));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName());
        userMap.put("role", user.getRole());
        userMap.put("phone", user.getPhone());
        userMap.put("dateOfBirth", user.getDateOfBirth());
        userMap.put("address", user.getAddress());
        userMap.put("specialization", user.getSpecialization());
        userMap.put("licenseNumber", user.getLicenseNumber());
        response.put("user", userMap);
        
        return ResponseEntity.ok(response);
    }
}
