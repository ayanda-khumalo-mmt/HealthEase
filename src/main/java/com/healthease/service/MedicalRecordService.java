package com.healthease.service;

import com.healthease.model.MedicalRecord;
import com.healthease.model.User;
import com.healthease.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {
    
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    
    public MedicalRecord createMedicalRecord(MedicalRecord medicalRecord) {
        return medicalRecordRepository.save(medicalRecord);
    }
    
    public Optional<MedicalRecord> findById(String id) {
        return medicalRecordRepository.findById(id);
    }
    
    public List<MedicalRecord> findByPatient(User patient) {
        return medicalRecordRepository.findByPatientOrderByVisitDateDesc(patient);
    }
    
    public List<MedicalRecord> findByDoctor(User doctor) {
        return medicalRecordRepository.findByDoctorOrderByVisitDateDesc(doctor);
    }
    
    public MedicalRecord updateMedicalRecord(String id, MedicalRecord updatedRecord) {
        return medicalRecordRepository.findById(id)
            .map(record -> {
                if (updatedRecord.getVisitDate() != null) record.setVisitDate(updatedRecord.getVisitDate());
                if (updatedRecord.getDiagnosis() != null) record.setDiagnosis(updatedRecord.getDiagnosis());
                if (updatedRecord.getPrescription() != null) record.setPrescription(updatedRecord.getPrescription());
                if (updatedRecord.getTests() != null) record.setTests(updatedRecord.getTests());
                if (updatedRecord.getNotes() != null) record.setNotes(updatedRecord.getNotes());
                if (updatedRecord.getFollowUpDate() != null) record.setFollowUpDate(updatedRecord.getFollowUpDate());
                return medicalRecordRepository.save(record);
            })
            .orElseThrow(() -> new RuntimeException("Medical record not found"));
    }
    
    public void deleteMedicalRecord(String id) {
        medicalRecordRepository.deleteById(id);
    }
}
