package com.healthease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String name;
    
    private UserRole role = UserRole.PATIENT;
    
    private String phone;
    
    private LocalDate dateOfBirth;
    
    private String address;
    
    // Doctor-specific fields
    private String specialization;
    
    private String licenseNumber;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum UserRole {
        ADMIN, PATIENT, DOCTOR
    }
}
