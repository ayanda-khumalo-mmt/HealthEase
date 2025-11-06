/**
 * Simple validation tests for HealthEase API structure
 */

const assert = require('assert');

// Test model imports
console.log('Testing model imports...');
const User = require('./server/models/User');
const Appointment = require('./server/models/Appointment');
const MedicalRecord = require('./server/models/MedicalRecord');
assert(User, 'User model should be defined');
assert(Appointment, 'Appointment model should be defined');
assert(MedicalRecord, 'MedicalRecord model should be defined');
console.log('✓ All models imported successfully');

// Test route imports
console.log('\nTesting route imports...');
const authRoutes = require('./server/routes/auth');
const appointmentRoutes = require('./server/routes/appointments');
const medicalRecordRoutes = require('./server/routes/medicalRecords');
const userRoutes = require('./server/routes/users');
assert(authRoutes, 'Auth routes should be defined');
assert(appointmentRoutes, 'Appointment routes should be defined');
assert(medicalRecordRoutes, 'Medical record routes should be defined');
assert(userRoutes, 'User routes should be defined');
console.log('✓ All routes imported successfully');

// Test middleware imports
console.log('\nTesting middleware imports...');
const { authenticate, authorize } = require('./server/middleware/auth');
assert(typeof authenticate === 'function', 'authenticate should be a function');
assert(typeof authorize === 'function', 'authorize should be a function');
console.log('✓ All middleware imported successfully');

// Test configuration imports
console.log('\nTesting configuration imports...');
const connectDB = require('./server/config/database');
assert(typeof connectDB === 'function', 'connectDB should be a function');
console.log('✓ Configuration imported successfully');

// Validate User schema
console.log('\nValidating User schema...');
const userSchema = User.schema;
assert(userSchema.path('email'), 'User should have email field');
assert(userSchema.path('password'), 'User should have password field');
assert(userSchema.path('name'), 'User should have name field');
assert(userSchema.path('role'), 'User should have role field');
console.log('✓ User schema is valid');

// Validate Appointment schema
console.log('\nValidating Appointment schema...');
const appointmentSchema = Appointment.schema;
assert(appointmentSchema.path('patient'), 'Appointment should have patient field');
assert(appointmentSchema.path('doctor'), 'Appointment should have doctor field');
assert(appointmentSchema.path('date'), 'Appointment should have date field');
assert(appointmentSchema.path('status'), 'Appointment should have status field');
console.log('✓ Appointment schema is valid');

// Validate MedicalRecord schema
console.log('\nValidating MedicalRecord schema...');
const medicalRecordSchema = MedicalRecord.schema;
assert(medicalRecordSchema.path('patient'), 'MedicalRecord should have patient field');
assert(medicalRecordSchema.path('doctor'), 'MedicalRecord should have doctor field');
assert(medicalRecordSchema.path('diagnosis'), 'MedicalRecord should have diagnosis field');
console.log('✓ MedicalRecord schema is valid');

console.log('\n✅ All validation tests passed!');
console.log('\nHealthEase API structure is valid and ready for use.');
console.log('\nTo run the application:');
console.log('1. Ensure MongoDB is running');
console.log('2. Create a .env file with required environment variables');
console.log('3. Run: npm start or npm run dev');
