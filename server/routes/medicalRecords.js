const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new medical record (doctor only)
router.post('/', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { patient, visitDate, diagnosis, prescription, tests, notes, followUpDate } = req.body;

    const medicalRecord = new MedicalRecord({
      patient,
      doctor: req.user._id,
      visitDate,
      diagnosis,
      prescription,
      tests,
      notes,
      followUpDate
    });

    await medicalRecord.save();
    await medicalRecord.populate('patient', 'name email dateOfBirth');
    await medicalRecord.populate('doctor', 'name email specialization');

    res.status(201).json({
      message: 'Medical record created successfully',
      medicalRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all medical records for a patient
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check authorization - patients can only view their own records
    if (req.user.role === 'patient' && patientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email dateOfBirth')
      .sort({ visitDate: -1 });

    res.json({ medicalRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current patient's medical records
router.get('/my-records', authenticate, authorize('patient'), async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name email specialization')
      .sort({ visitDate: -1 });

    res.json({ medicalRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific medical record
router.get('/:id', authenticate, async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email dateOfBirth')
      .populate('doctor', 'name email specialization');

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && medicalRecord.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (req.user.role === 'doctor' && medicalRecord.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    res.json({ medicalRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a medical record (doctor only)
router.put('/:id', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { visitDate, diagnosis, prescription, tests, notes, followUpDate } = req.body;

    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if the doctor is authorized to update this record
    if (medicalRecord.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    medicalRecord.visitDate = visitDate || medicalRecord.visitDate;
    medicalRecord.diagnosis = diagnosis || medicalRecord.diagnosis;
    medicalRecord.prescription = prescription || medicalRecord.prescription;
    medicalRecord.tests = tests || medicalRecord.tests;
    medicalRecord.notes = notes || medicalRecord.notes;
    medicalRecord.followUpDate = followUpDate || medicalRecord.followUpDate;

    await medicalRecord.save();
    await medicalRecord.populate('patient', 'name email dateOfBirth');
    await medicalRecord.populate('doctor', 'name email specialization');

    res.json({
      message: 'Medical record updated successfully',
      medicalRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
