// API Configuration
const API_BASE_URL = '/api';
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Check if user is authenticated
function checkAuth() {
    authToken = localStorage.getItem('token');
    if (authToken) {
        fetchCurrentUser();
    }
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            localStorage.removeItem('token');
            authToken = null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        authToken = null;
    }
}

// Authentication Forms
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.auth-tabs .tab-btn')[0].classList.add('active');
    document.querySelectorAll('.auth-tabs .tab-btn')[1].classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.auth-tabs .tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.auth-tabs .tab-btn')[1].classList.add('active');
}

function handleRoleChange() {
    const role = document.getElementById('register-role').value;
    const doctorFields = document.getElementById('doctor-fields');
    doctorFields.style.display = role === 'doctor' ? 'block' : 'none';
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            showDashboard();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        phone: document.getElementById('register-phone').value,
        dateOfBirth: document.getElementById('register-dob').value,
        address: document.getElementById('register-address').value,
        role: document.getElementById('register-role').value
    };

    if (userData.role === 'doctor') {
        userData.specialization = document.getElementById('register-specialization').value;
        userData.licenseNumber = document.getElementById('register-license').value;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            showDashboard();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('nav-user-name').textContent = `${currentUser.name} (${currentUser.role})`;

    // Show appropriate dashboard
    if (currentUser.role === 'patient') {
        document.getElementById('patient-dashboard').style.display = 'block';
        loadPatientData();
    } else if (currentUser.role === 'doctor') {
        document.getElementById('doctor-dashboard').style.display = 'block';
        loadDoctorData();
    } else if (currentUser.role === 'admin') {
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminData();
    }
}

// Patient Functions
function showPatientSection(section) {
    document.querySelectorAll('#patient-dashboard .dashboard-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('#patient-dashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (section === 'medical-history') {
        document.getElementById('medical-history-section').style.display = 'block';
        document.querySelectorAll('#patient-dashboard .tab-btn')[0].classList.add('active');
        loadMedicalRecords();
    } else if (section === 'appointments') {
        document.getElementById('appointments-section').style.display = 'block';
        document.querySelectorAll('#patient-dashboard .tab-btn')[1].classList.add('active');
        loadPatientAppointments();
    } else if (section === 'schedule') {
        document.getElementById('schedule-section').style.display = 'block';
        document.querySelectorAll('#patient-dashboard .tab-btn')[2].classList.add('active');
        loadDoctors();
    }
}

async function loadPatientData() {
    loadMedicalRecords();
}

async function loadMedicalRecords() {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/my-records`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const recordsList = document.getElementById('medical-records-list');

        if (data.medicalRecords && data.medicalRecords.length > 0) {
            recordsList.innerHTML = data.medicalRecords.map(record => `
                <div class="card">
                    <h3>Visit on ${new Date(record.visitDate).toLocaleDateString()}</h3>
                    <div class="card-info"><strong>Doctor:</strong> ${record.doctor.name} (${record.doctor.specialization || 'General'})</div>
                    <div class="card-info"><strong>Diagnosis:</strong> ${record.diagnosis}</div>
                    ${record.prescription ? `<div class="card-info"><strong>Prescription:</strong> ${record.prescription}</div>` : ''}
                    ${record.notes ? `<div class="card-info"><strong>Notes:</strong> ${record.notes}</div>` : ''}
                    ${record.tests && record.tests.length > 0 ? `
                        <div class="card-info"><strong>Tests:</strong></div>
                        <ul>
                            ${record.tests.map(test => `<li>${test.testName}: ${test.result}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${record.followUpDate ? `<div class="card-info"><strong>Follow-up:</strong> ${new Date(record.followUpDate).toLocaleDateString()}</div>` : ''}
                </div>
            `).join('');
        } else {
            recordsList.innerHTML = '<div class="empty-state"><p>No medical records found</p></div>';
        }
    } catch (error) {
        console.error('Error loading medical records:', error);
    }
}

async function loadPatientAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const appointmentsList = document.getElementById('patient-appointments-list');

        if (data.appointments && data.appointments.length > 0) {
            appointmentsList.innerHTML = data.appointments.map(appointment => `
                <div class="card">
                    <h3>Appointment with Dr. ${appointment.doctor.name}</h3>
                    <div class="card-info"><strong>Specialization:</strong> ${appointment.doctor.specialization || 'General'}</div>
                    <div class="card-info"><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</div>
                    <div class="card-info"><strong>Time:</strong> ${appointment.time}</div>
                    <div class="card-info"><strong>Reason:</strong> ${appointment.reason}</div>
                    <div class="card-info"><strong>Status:</strong> <span class="status-badge status-${appointment.status}">${appointment.status.toUpperCase()}</span></div>
                    ${appointment.status === 'pending' ? `
                        <div class="card-actions">
                            <button class="btn btn-danger" onclick="cancelAppointment('${appointment._id}')">Cancel</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            appointmentsList.innerHTML = '<div class="empty-state"><p>No appointments found</p></div>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/doctors`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const doctorSelect = document.getElementById('appointment-doctor');

        if (data.doctors && data.doctors.length > 0) {
            doctorSelect.innerHTML = '<option value="">Select a doctor</option>' + 
                data.doctors.map(doctor => `
                    <option value="${doctor._id}">${doctor.name} - ${doctor.specialization || 'General'}</option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

async function handleScheduleAppointment(event) {
    event.preventDefault();

    const appointmentData = {
        doctor: document.getElementById('appointment-doctor').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        reason: document.getElementById('appointment-reason').value,
        notes: document.getElementById('appointment-notes').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appointmentData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Appointment scheduled successfully!');
            event.target.reset();
            showPatientSection('appointments');
        } else {
            alert(data.message || 'Failed to schedule appointment');
        }
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        alert('Failed to schedule appointment');
    }
}

async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            alert('Appointment cancelled successfully');
            loadPatientAppointments();
        } else {
            alert('Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment');
    }
}

// Doctor Functions
function showDoctorSection(section) {
    document.querySelectorAll('#doctor-dashboard .dashboard-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('#doctor-dashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (section === 'appointments') {
        document.getElementById('doctor-appointments-section').style.display = 'block';
        document.querySelectorAll('#doctor-dashboard .tab-btn')[0].classList.add('active');
        loadDoctorAppointments();
    } else if (section === 'patients') {
        document.getElementById('patients-section').style.display = 'block';
        document.querySelectorAll('#doctor-dashboard .tab-btn')[1].classList.add('active');
        loadDoctorPatients();
    } else if (section === 'add-record') {
        document.getElementById('add-record-section').style.display = 'block';
        document.querySelectorAll('#doctor-dashboard .tab-btn')[2].classList.add('active');
        loadPatientsForRecord();
    }
}

async function loadDoctorData() {
    loadDoctorAppointments();
}

async function loadDoctorAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const appointmentsList = document.getElementById('doctor-appointments-list');

        if (data.appointments && data.appointments.length > 0) {
            appointmentsList.innerHTML = data.appointments.map(appointment => `
                <div class="card">
                    <h3>Appointment with ${appointment.patient.name}</h3>
                    <div class="card-info"><strong>Patient Email:</strong> ${appointment.patient.email}</div>
                    <div class="card-info"><strong>Phone:</strong> ${appointment.patient.phone || 'N/A'}</div>
                    <div class="card-info"><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</div>
                    <div class="card-info"><strong>Time:</strong> ${appointment.time}</div>
                    <div class="card-info"><strong>Reason:</strong> ${appointment.reason}</div>
                    <div class="card-info"><strong>Status:</strong> <span class="status-badge status-${appointment.status}">${appointment.status.toUpperCase()}</span></div>
                    ${appointment.status === 'pending' ? `
                        <div class="card-actions">
                            <button class="btn btn-success" onclick="updateAppointmentStatus('${appointment._id}', 'accepted')">Accept</button>
                            <button class="btn btn-danger" onclick="updateAppointmentStatus('${appointment._id}', 'cancelled')">Cancel</button>
                        </div>
                    ` : ''}
                    ${appointment.status === 'accepted' ? `
                        <div class="card-actions">
                            <button class="btn btn-info" onclick="updateAppointmentStatus('${appointment._id}', 'completed')">Mark as Completed</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            appointmentsList.innerHTML = '<div class="empty-state"><p>No appointments found</p></div>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

async function updateAppointmentStatus(appointmentId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            alert(`Appointment ${status} successfully`);
            loadDoctorAppointments();
        } else {
            alert('Failed to update appointment status');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment status');
    }
}

async function loadDoctorPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/patients`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const patientsList = document.getElementById('patients-list');

        if (data.patients && data.patients.length > 0) {
            patientsList.innerHTML = data.patients.map(patient => `
                <div class="card">
                    <h3>${patient.name}</h3>
                    <div class="card-info"><strong>Email:</strong> ${patient.email}</div>
                    <div class="card-info"><strong>Phone:</strong> ${patient.phone || 'N/A'}</div>
                    <div class="card-info"><strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                    <div class="card-info"><strong>Address:</strong> ${patient.address || 'N/A'}</div>
                    <div class="card-actions">
                        <button class="btn btn-info" onclick="viewPatientRecords('${patient._id}')">View Medical Records</button>
                    </div>
                </div>
            `).join('');
        } else {
            patientsList.innerHTML = '<div class="empty-state"><p>No patients found</p></div>';
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

async function viewPatientRecords(patientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (data.medicalRecords && data.medicalRecords.length > 0) {
            // Create a modal-like display for medical records
            const recordsHTML = `
                <div style="background: white; padding: 2rem; border-radius: 5px; max-width: 600px; margin: 2rem auto;">
                    <h3>Medical Records</h3>
                    ${data.medicalRecords.map(record => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                            <strong>Date:</strong> ${new Date(record.visitDate).toLocaleDateString()}<br>
                            <strong>Diagnosis:</strong> ${record.diagnosis}<br>
                            ${record.prescription ? `<strong>Prescription:</strong> ${record.prescription}<br>` : ''}
                            ${record.notes ? `<strong>Notes:</strong> ${record.notes}<br>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Create a simple modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;';
            modal.innerHTML = recordsHTML + '<div style="text-align: center; padding: 1rem;"><button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button></div>';
            document.body.appendChild(modal);
        } else {
            alert('No medical records found for this patient');
        }
    } catch (error) {
        console.error('Error loading patient records:', error);
        alert('Failed to load patient records');
    }
}

async function loadPatientsForRecord() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/patients`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const patientSelect = document.getElementById('record-patient');

        if (data.patients && data.patients.length > 0) {
            patientSelect.innerHTML = '<option value="">Select a patient</option>' + 
                data.patients.map(patient => `
                    <option value="${patient._id}">${patient.name} - ${patient.email}</option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

async function handleAddMedicalRecord(event) {
    event.preventDefault();

    const recordData = {
        patient: document.getElementById('record-patient').value,
        visitDate: document.getElementById('record-date').value,
        diagnosis: document.getElementById('record-diagnosis').value,
        prescription: document.getElementById('record-prescription').value,
        notes: document.getElementById('record-notes').value,
        followUpDate: document.getElementById('record-followup').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/medical-records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recordData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Medical record added successfully!');
            event.target.reset();
        } else {
            alert(data.message || 'Failed to add medical record');
        }
    } catch (error) {
        console.error('Error adding medical record:', error);
        alert('Failed to add medical record');
    }
}

// Admin Functions
function showAdminSection(section) {
    document.querySelectorAll('#admin-dashboard .dashboard-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('#admin-dashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (section === 'users') {
        document.getElementById('users-section').style.display = 'block';
        document.querySelectorAll('#admin-dashboard .tab-btn')[0].classList.add('active');
        loadAllUsers();
    }
}

async function loadAdminData() {
    loadAllUsers();
}

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const usersList = document.getElementById('users-list');

        if (data.users && data.users.length > 0) {
            usersList.innerHTML = data.users.map(user => `
                <div class="card">
                    <h3>${user.name}</h3>
                    <div class="card-info"><strong>Email:</strong> ${user.email}</div>
                    <div class="card-info"><strong>Role:</strong> ${user.role}</div>
                    <div class="card-info"><strong>Phone:</strong> ${user.phone || 'N/A'}</div>
                    ${user.specialization ? `<div class="card-info"><strong>Specialization:</strong> ${user.specialization}</div>` : ''}
                    ${user.licenseNumber ? `<div class="card-info"><strong>License:</strong> ${user.licenseNumber}</div>` : ''}
                    <div class="card-info"><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
        } else {
            usersList.innerHTML = '<div class="empty-state"><p>No users found</p></div>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}
