package com.healthease.controller;

import com.healthease.model.MedicalRecord;
import com.healthease.model.User;
import com.healthease.service.MedicalRecordService;
import com.healthease.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    
    @Autowired
    private MedicalRecordService medicalRecordService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createMedicalRecord(
            @RequestBody MedicalRecord medicalRecord,
            @AuthenticationPrincipal User doctor) {
        
        medicalRecord.setDoctor(doctor);
        
        User patient = userService.findById(medicalRecord.getPatient().getId())
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        medicalRecord.setPatient(patient);
        
        MedicalRecord savedRecord = medicalRecordService.createMedicalRecord(medicalRecord);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Medical record created successfully");
        response.put("medicalRecord", savedRecord);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientMedicalRecords(
            @PathVariable String patientId,
            @AuthenticationPrincipal User user) {
        
        // Check authorization - patients can only view their own records
        if (user.getRole() == User.UserRole.PATIENT && !patientId.equals(user.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        User patient = userService.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<MedicalRecord> medicalRecords = medicalRecordService.findByPatient(patient);
        
        Map<String, Object> response = new HashMap<>();
        response.put("medicalRecords", medicalRecords);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-records")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getMyMedicalRecords(@AuthenticationPrincipal User patient) {
        List<MedicalRecord> medicalRecords = medicalRecordService.findByPatient(patient);
        
        Map<String, Object> response = new HashMap<>();
        response.put("medicalRecords", medicalRecords);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMedicalRecord(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        
        MedicalRecord medicalRecord = medicalRecordService.findById(id)
            .orElseThrow(() -> new RuntimeException("Medical record not found"));
        
        // Check authorization
        if (user.getRole() == User.UserRole.PATIENT && 
            !medicalRecord.getPatient().getId().equals(user.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        if (user.getRole() == User.UserRole.DOCTOR && 
            !medicalRecord.getDoctor().getId().equals(user.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("medicalRecord", medicalRecord);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateMedicalRecord(
            @PathVariable String id,
            @RequestBody MedicalRecord medicalRecord,
            @AuthenticationPrincipal User doctor) {
        
        MedicalRecord existingRecord = medicalRecordService.findById(id)
            .orElseThrow(() -> new RuntimeException("Medical record not found"));
        
        // Check if the doctor is authorized
        if (!existingRecord.getDoctor().getId().equals(doctor.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        MedicalRecord updatedRecord = medicalRecordService.updateMedicalRecord(id, medicalRecord);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Medical record updated successfully");
        response.put("medicalRecord", updatedRecord);
        
        return ResponseEntity.ok(response);
    }
}
