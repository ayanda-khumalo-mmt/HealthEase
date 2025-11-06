const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new appointment (patient only)
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctor, date, time, reason, notes } = req.body;

    const appointment = new Appointment({
      patient: req.user._id,
      doctor,
      date,
      time,
      reason,
      notes,
      status: 'pending'
    });

    await appointment.save();
    await appointment.populate('doctor', 'name email specialization');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all appointments for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific appointment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update appointment status (doctor only)
router.patch('/:id/status', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the doctor is authorized to update this appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    appointment.status = status;
    await appointment.save();
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialization');

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel appointment (patient can cancel their own)
router.patch('/:id/cancel', authenticate, authorize('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the patient is authorized to cancel this appointment
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name email specialization');

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
