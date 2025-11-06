package com.healthease.controller;

import com.healthease.model.Appointment;
import com.healthease.model.User;
import com.healthease.service.AppointmentService;
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
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createAppointment(
            @RequestBody Appointment appointment,
            @AuthenticationPrincipal User patient) {
        
        appointment.setPatient(patient);
        
        User doctor = userService.findById(appointment.getDoctor().getId())
            .orElseThrow(() -> new RuntimeException("Doctor not found"));
        appointment.setDoctor(doctor);
        
        Appointment savedAppointment = appointmentService.createAppointment(appointment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Appointment created successfully");
        response.put("appointment", savedAppointment);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<?> getAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> appointments;
        
        if (user.getRole() == User.UserRole.PATIENT) {
            appointments = appointmentService.findByPatient(user);
        } else if (user.getRole() == User.UserRole.DOCTOR) {
            appointments = appointmentService.findByDoctor(user);
        } else {
            appointments = List.of();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appointments", appointments);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        
        Appointment appointment = appointmentService.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // Check authorization
        if (user.getRole() == User.UserRole.PATIENT && 
            !appointment.getPatient().getId().equals(user.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        if (user.getRole() == User.UserRole.DOCTOR && 
            !appointment.getDoctor().getId().equals(user.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appointment", appointment);
        
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User doctor) {
        
        Appointment appointment = appointmentService.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // Check if the doctor is authorized
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        String statusStr = request.get("status");
        Appointment.AppointmentStatus status = Appointment.AppointmentStatus.valueOf(statusStr.toUpperCase());
        
        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Appointment status updated successfully");
        response.put("appointment", updatedAppointment);
        
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable String id,
            @AuthenticationPrincipal User patient) {
        
        Appointment appointment = appointmentService.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        // Check if the patient is authorized
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Access forbidden");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }
        
        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(
            id, Appointment.AppointmentStatus.CANCELLED);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Appointment cancelled successfully");
        response.put("appointment", updatedAppointment);
        
        return ResponseEntity.ok(response);
    }
}
