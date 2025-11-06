package com.healthease.service;

import com.healthease.model.Appointment;
import com.healthease.model.User;
import com.healthease.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    public Optional<Appointment> findById(String id) {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> findByPatient(User patient) {
        return appointmentRepository.findByPatientOrderByDateDesc(patient);
    }
    
    public List<Appointment> findByDoctor(User doctor) {
        return appointmentRepository.findByDoctorOrderByDateDesc(doctor);
    }
    
    public Appointment updateAppointmentStatus(String id, Appointment.AppointmentStatus status) {
        return appointmentRepository.findById(id)
            .map(appointment -> {
                appointment.setStatus(status);
                return appointmentRepository.save(appointment);
            })
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
    
    public void deleteAppointment(String id) {
        appointmentRepository.deleteById(id);
    }
}
