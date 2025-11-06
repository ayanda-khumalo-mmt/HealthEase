package com.healthease.controller;

import com.healthease.model.Appointment;
import com.healthease.model.User;
import com.healthease.service.AppointmentService;
import com.healthease.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.findAll();
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", users);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        List<User> doctors = userService.findByRole(User.UserRole.DOCTOR);
        
        Map<String, Object> response = new HashMap<>();
        response.put("doctors", doctors);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getDoctorPatients(@AuthenticationPrincipal User doctor) {
        // Get unique patient IDs from appointments
        List<Appointment> appointments = appointmentService.findByDoctor(doctor);
        List<String> patientIds = appointments.stream()
            .map(appointment -> appointment.getPatient().getId())
            .distinct()
            .collect(Collectors.toList());
        
        // Get patient details
        List<User> patients = patientIds.stream()
            .map(id -> userService.findById(id).orElse(null))
            .filter(patient -> patient != null)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("patients", patients);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        User user = userService.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody User user) {
        
        User updatedUser = userService.updateUser(id, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User updated successfully");
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", updatedUser.getId());
        userMap.put("email", updatedUser.getEmail());
        userMap.put("name", updatedUser.getName());
        userMap.put("role", updatedUser.getRole());
        response.put("user", userMap);
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        
        return ResponseEntity.ok(response);
    }
}
