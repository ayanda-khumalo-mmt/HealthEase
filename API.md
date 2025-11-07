# HealthEase API Documentation

Complete API reference for the HealthEase health web application.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": [ ... ]
}
```

## Rate Limiting

- **General Routes**: 100 requests per 15 minutes per IP
- **Authentication Routes**: 5 requests per 15 minutes per IP

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "patient",
  "phone": "123-456-7890",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456"
}
```

**Required Fields**: `email`, `password`, `name`

**Optional Fields**: `role` (default: "patient"), `phone`, `dateOfBirth`, `address`, `specialization` (doctors only), `licenseNumber` (doctors only)

**Response**: `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient"
  }
}
```

---

### Login
Authenticate and receive a JWT token.

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient"
  }
}
```

---

### Get Current User
Get authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Access**: Protected (All authenticated users)

**Response**: `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient",
    "phone": "123-456-7890",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "address": "123 Main St"
  }
}
```

---

## Appointment Endpoints

### Create Appointment
Schedule a new appointment (Patient only).

**Endpoint**: `POST /api/appointments`

**Access**: Protected (Patient role)

**Request Body**:
```json
{
  "doctor": "507f1f77bcf86cd799439011",
  "date": "2024-12-25",
  "time": "10:00 AM",
  "reason": "Regular checkup",
  "notes": "Feeling tired lately"
}
```

**Response**: `201 Created`
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439012",
    "patient": "507f1f77bcf86cd799439010",
    "doctor": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Sarah Smith",
      "email": "doctor@example.com",
      "specialization": "Cardiology"
    },
    "date": "2024-12-25T00:00:00.000Z",
    "time": "10:00 AM",
    "reason": "Regular checkup",
    "status": "pending"
  }
}
```

---

### Get Appointments
Get all appointments for the current user.

**Endpoint**: `GET /api/appointments`

**Access**: Protected (All authenticated users)

**Response**: `200 OK`
```json
{
  "appointments": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "patient": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "John Doe",
        "email": "patient@example.com",
        "phone": "123-456-7890"
      },
      "doctor": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Dr. Sarah Smith",
        "email": "doctor@example.com",
        "specialization": "Cardiology"
      },
      "date": "2024-12-25T00:00:00.000Z",
      "time": "10:00 AM",
      "reason": "Regular checkup",
      "status": "pending"
    }
  ]
}
```

---

### Get Specific Appointment
Get details of a specific appointment.

**Endpoint**: `GET /api/appointments/:id`

**Access**: Protected (Patient/Doctor involved in appointment)

**Response**: `200 OK`
```json
{
  "appointment": {
    "_id": "507f1f77bcf86cd799439012",
    "patient": { ... },
    "doctor": { ... },
    "date": "2024-12-25T00:00:00.000Z",
    "time": "10:00 AM",
    "reason": "Regular checkup",
    "status": "pending"
  }
}
```

---

### Update Appointment Status
Accept, cancel, or complete an appointment (Doctor only).

**Endpoint**: `PATCH /api/appointments/:id/status`

**Access**: Protected (Doctor role, must be assigned doctor)

**Request Body**:
```json
{
  "status": "accepted"
}
```

**Valid Status Values**: `accepted`, `cancelled`, `completed`

**Response**: `200 OK`
```json
{
  "message": "Appointment status updated successfully",
  "appointment": { ... }
}
```

---

### Cancel Appointment
Cancel an appointment (Patient only).

**Endpoint**: `PATCH /api/appointments/:id/cancel`

**Access**: Protected (Patient role, must be appointment owner)

**Response**: `200 OK`
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": { ... }
}
```

---

## Medical Records Endpoints

### Create Medical Record
Add a new medical record (Doctor only).

**Endpoint**: `POST /api/medical-records`

**Access**: Protected (Doctor role)

**Request Body**:
```json
{
  "patient": "507f1f77bcf86cd799439010",
  "visitDate": "2024-11-06",
  "diagnosis": "Mild hypertension",
  "prescription": "Lisinopril 10mg daily",
  "tests": [
    {
      "testName": "Blood Pressure",
      "result": "140/90",
      "date": "2024-11-06"
    }
  ],
  "notes": "Patient advised to reduce salt intake",
  "followUpDate": "2024-12-06"
}
```

**Response**: `201 Created`
```json
{
  "message": "Medical record created successfully",
  "medicalRecord": {
    "_id": "507f1f77bcf86cd799439013",
    "patient": { ... },
    "doctor": { ... },
    "visitDate": "2024-11-06T00:00:00.000Z",
    "diagnosis": "Mild hypertension",
    "prescription": "Lisinopril 10mg daily",
    "tests": [ ... ],
    "notes": "Patient advised to reduce salt intake",
    "followUpDate": "2024-12-06T00:00:00.000Z"
  }
}
```

---

### Get Patient Medical Records
Get medical records for a specific patient.

**Endpoint**: `GET /api/medical-records/patient/:patientId`

**Access**: Protected (Patient viewing own records, or Doctor)

**Response**: `200 OK`
```json
{
  "medicalRecords": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "patient": { ... },
      "doctor": { ... },
      "visitDate": "2024-11-06T00:00:00.000Z",
      "diagnosis": "Mild hypertension",
      "prescription": "Lisinopril 10mg daily",
      "tests": [ ... ]
    }
  ]
}
```

---

### Get My Medical Records
Get current patient's medical records (Patient only).

**Endpoint**: `GET /api/medical-records/my-records`

**Access**: Protected (Patient role)

**Response**: `200 OK`
```json
{
  "medicalRecords": [ ... ]
}
```

---

### Get Specific Medical Record
Get details of a specific medical record.

**Endpoint**: `GET /api/medical-records/:id`

**Access**: Protected (Patient owner or assigned doctor)

**Response**: `200 OK`
```json
{
  "medicalRecord": { ... }
}
```

---

### Update Medical Record
Update an existing medical record (Doctor only).

**Endpoint**: `PUT /api/medical-records/:id`

**Access**: Protected (Doctor role, must be record creator)

**Request Body**:
```json
{
  "diagnosis": "Updated diagnosis",
  "prescription": "Updated prescription",
  "notes": "Updated notes"
}
```

**Response**: `200 OK`
```json
{
  "message": "Medical record updated successfully",
  "medicalRecord": { ... }
}
```

---

## User Management Endpoints

### Get All Users
Get list of all users (Admin only).

**Endpoint**: `GET /api/users`

**Access**: Protected (Admin role)

**Response**: `200 OK`
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "patient",
      "phone": "123-456-7890",
      "createdAt": "2024-11-06T00:00:00.000Z"
    }
  ]
}
```

---

### Get All Doctors
Get list of all doctors.

**Endpoint**: `GET /api/users/doctors`

**Access**: Protected (All authenticated users)

**Response**: `200 OK`
```json
{
  "doctors": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "doctor@example.com",
      "name": "Dr. Sarah Smith",
      "specialization": "Cardiology",
      "licenseNumber": "MD123456",
      "phone": "098-765-4321"
    }
  ]
}
```

---

### Get Doctor's Patients
Get list of patients for a doctor (Doctor only).

**Endpoint**: `GET /api/users/patients`

**Access**: Protected (Doctor role)

**Response**: `200 OK`
```json
{
  "patients": [
    {
      "_id": "507f1f77bcf86cd799439010",
      "email": "patient@example.com",
      "name": "John Doe",
      "phone": "123-456-7890",
      "dateOfBirth": "1990-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Specific User
Get details of a specific user (Admin only).

**Endpoint**: `GET /api/users/:id`

**Access**: Protected (Admin role)

**Response**: `200 OK`
```json
{
  "user": { ... }
}
```

---

### Update User
Update user information (Admin only).

**Endpoint**: `PUT /api/users/:id`

**Access**: Protected (Admin role)

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "doctor"
}
```

**Response**: `200 OK`
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

---

### Delete User
Delete a user (Admin only).

**Endpoint**: `DELETE /api/users/:id`

**Access**: Protected (Admin role)

**Response**: `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Examples

### Complete User Flow Example

#### 1. Register as Patient
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "patient"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Get Doctors List
```bash
curl http://localhost:3000/api/users/doctors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Schedule Appointment
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": "DOCTOR_ID",
    "date": "2024-12-25",
    "time": "10:00 AM",
    "reason": "Regular checkup"
  }'
```

#### 5. View My Medical Records
```bash
curl http://localhost:3000/api/medical-records/my-records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## WebSocket Support

Currently not implemented. Future versions may include real-time notifications for:
- Appointment status changes
- New medical records
- System announcements

---

## Versioning

Current API Version: v1.0.0

The API follows semantic versioning. Breaking changes will result in a major version bump.

---

Last Updated: 2025-11-06
