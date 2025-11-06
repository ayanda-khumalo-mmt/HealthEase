const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function setupTestDB() {
    // Start in-memory MongoDB
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log('In-memory MongoDB started at:', uri);
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
    
    console.log('Connected to in-memory MongoDB');
    
    return mongod;
}

async function seedData() {
    const User = require('./server/models/User');
    const Appointment = require('./server/models/Appointment');
    const MedicalRecord = require('./server/models/MedicalRecord');
    
    console.log('Seeding test data...');
    
    // Create test users
    const patient = new User({
        email: 'patient@test.com',
        password: 'password123',
        name: 'John Patient',
        role: 'patient',
        phone: '123-456-7890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Main St'
    });
    await patient.save();
    console.log('Created patient:', patient.email);
    
    const doctor = new User({
        email: 'doctor@test.com',
        password: 'password123',
        name: 'Dr. Sarah Smith',
        role: 'doctor',
        phone: '098-765-4321',
        specialization: 'Cardiology',
        licenseNumber: 'MD123456'
    });
    await doctor.save();
    console.log('Created doctor:', doctor.email);
    
    const admin = new User({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
        phone: '555-555-5555'
    });
    await admin.save();
    console.log('Created admin:', admin.email);
    
    // Create a test appointment
    const appointment = new Appointment({
        patient: patient._id,
        doctor: doctor._id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '10:00 AM',
        status: 'pending',
        reason: 'Regular checkup'
    });
    await appointment.save();
    console.log('Created appointment');
    
    // Create a test medical record
    const medicalRecord = new MedicalRecord({
        patient: patient._id,
        doctor: doctor._id,
        visitDate: new Date(Date.now() - 86400000), // Yesterday
        diagnosis: 'Mild hypertension',
        prescription: 'Lisinopril 10mg daily',
        notes: 'Patient advised to reduce salt intake and exercise regularly'
    });
    await medicalRecord.save();
    console.log('Created medical record');
    
    console.log('\nTest data seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Patient - Email: patient@test.com, Password: password123');
    console.log('Doctor - Email: doctor@test.com, Password: password123');
    console.log('Admin - Email: admin@test.com, Password: password123');
}

async function startTestServer() {
    const mongod = await setupTestDB();
    await seedData();
    
    // Update the database URI for the server
    process.env.MONGODB_URI = 'mongodb://localhost:27017/healthease'; // This will be overridden by mongoose connection
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.PORT = 3000;
    
    // Start the Express server
    require('./server.js');
}

startTestServer().catch(err => {
    console.error('Error starting test server:', err);
    process.exit(1);
});
