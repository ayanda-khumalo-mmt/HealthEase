package com.healthease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {
    
    @Id
    private String id;
    
    @DBRef
    private User patient;
    
    @DBRef
    private User doctor;
    
    private LocalDate date;
    
    private String time;
    
    private AppointmentStatus status = AppointmentStatus.PENDING;
    
    private String reason;
    
    private String notes;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum AppointmentStatus {
        PENDING, ACCEPTED, CANCELLED, COMPLETED
    }
}
