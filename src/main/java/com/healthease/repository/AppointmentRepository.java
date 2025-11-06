package com.healthease.repository;

import com.healthease.model.Appointment;
import com.healthease.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(User doctor);
    List<Appointment> findByPatientOrderByDateDesc(User patient);
    List<Appointment> findByDoctorOrderByDateDesc(User doctor);
}
