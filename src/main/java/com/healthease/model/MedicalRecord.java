package com.healthease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_records")
public class MedicalRecord {
    
    @Id
    private String id;
    
    @DBRef
    private User patient;
    
    @DBRef
    private User doctor;
    
    private LocalDate visitDate;
    
    private String diagnosis;
    
    private String prescription;
    
    private List<Test> tests = new ArrayList<>();
    
    private String notes;
    
    private LocalDate followUpDate;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Test {
        private String testName;
        private String result;
        private LocalDate date;
    }
}
