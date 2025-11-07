package com.healthease.dto;

import com.healthease.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private User.UserRole role = User.UserRole.PATIENT;
    
    private String phone;
    
    private LocalDate dateOfBirth;
    
    private String address;
    
    // Doctor-specific fields
    private String specialization;
    
    private String licenseNumber;
}
