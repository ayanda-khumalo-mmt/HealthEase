# HealthEase

A comprehensive health web application that connects patients with doctors, enabling them to manage medical records, schedule appointments, and track health history.

## Features

### For Patients
- **View Medical History**: Access complete medical records including doctor visits, prescriptions, tests, and diagnoses
- **Schedule Appointments**: Book appointments with available doctors
- **Manage Appointments**: View upcoming appointments and cancel if needed
- **Profile Management**: Maintain personal health information

### For Doctors
- **Patient Management**: View all patients and their medical histories
- **Appointment Management**: Accept, cancel, or complete patient appointments
- **Medical Records**: Create and update patient medical records
- **Patient Dashboard**: Access comprehensive patient information

### For Administrators
- **User Management**: View and manage all users in the system
- **System Oversight**: Monitor all patients, doctors, and appointments

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Security**: bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayanda-khumalo-mmt/HealthEase.git
   cd HealthEase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/healthease
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   mongod
   ```

5. **Run the application**
   
   For development (with auto-restart):
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Appointments
- `GET /api/appointments` - Get all appointments for current user
- `POST /api/appointments` - Create new appointment (patient)
- `GET /api/appointments/:id` - Get specific appointment
- `PATCH /api/appointments/:id/status` - Update appointment status (doctor)
- `PATCH /api/appointments/:id/cancel` - Cancel appointment (patient)

### Medical Records
- `GET /api/medical-records/my-records` - Get patient's own records
- `GET /api/medical-records/patient/:patientId` - Get patient records
- `POST /api/medical-records` - Create medical record (doctor)
- `GET /api/medical-records/:id` - Get specific record
- `PUT /api/medical-records/:id` - Update medical record (doctor)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/patients` - Get doctor's patients
- `GET /api/users/:id` - Get specific user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## User Roles

The application supports three user roles:

1. **Patient**: Can view their medical history, schedule appointments, and manage their profile
2. **Doctor**: Can view patients, manage appointments, and create/update medical records
3. **Admin**: Can manage all users and have system-wide access

## Usage

### First Time Setup

1. **Register as a Patient**:
   - Click "Register" on the homepage
   - Fill in your details
   - Select "Patient" as your role

2. **Register as a Doctor**:
   - Click "Register" on the homepage
   - Fill in your details
   - Select "Doctor" as your role
   - Provide specialization and license number

3. **Create Admin User**:
   - Register a user through the API or modify an existing user's role in the database to "admin"

### Patient Workflow

1. Login to your account
2. View your medical history in the "Medical History" tab
3. Schedule an appointment:
   - Click "Schedule Appointment"
   - Select a doctor
   - Choose date and time
   - Provide reason for visit
   - Submit
4. View and manage appointments in "My Appointments"

### Doctor Workflow

1. Login to your account
2. View pending appointments in the "Appointments" tab
3. Accept or cancel appointments as needed
4. View your patients in the "My Patients" tab
5. Add medical records for patients after visits

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Protected API endpoints
- Input validation

## Development

### Project Structure
```
HealthEase/
├── server/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── MedicalRecord.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   ├── medicalRecords.js
│   │   └── users.js
│   └── middleware/
│       └── auth.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── server.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the GitHub repository.