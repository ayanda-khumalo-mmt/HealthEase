package com.healthease.repository;

import com.healthease.model.MedicalRecord;
import com.healthease.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientOrderByVisitDateDesc(User patient);
    List<MedicalRecord> findByDoctorOrderByVisitDateDesc(User doctor);
}
