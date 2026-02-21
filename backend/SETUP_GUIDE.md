# FleetFlow Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

## Step 1: Install MongoDB

### Option A: Local MongoDB Installation

**Windows/Mac:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Follow the installation wizard
3. MongoDB will run as a service on `localhost:27017`

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (Cloud - Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string (will be in format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

## Step 2: Setup Backend Directory Structure

The backend folder structure should look like this:
```
backend/
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── Trip.js
│   ├── Maintenance.js
│   └── FuelExpense.js
├── routes/
│   ├── auth.js
│   ├── vehicles.js
│   ├── trips.js
│   ├── maintenance.js
│   ├── fuel.js
│   └── analytics.js
├── middleware/
│   └── auth.js
├── .env
├── package.json
├── server.js
└── SETUP_GUIDE.md
```

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `cors` - Cross-Origin Resource Sharing
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemon` - Auto-restart on file changes (dev only)

## Step 4: Configure MongoDB Connection

### Option A: Local MongoDB
Edit `.env` file and set:
```
MONGODB_URI=mongodb://localhost:27017/fleetflow
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Option B: MongoDB Atlas
Edit `.env` file and set:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fleetflow
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster` with your cluster name

## Step 5: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
FleetFlow Backend running on port 5000
MongoDB connected successfully
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/credentials` - Get hardcoded credentials (for reference)

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle (Manager only)
- `PUT /api/vehicles/:id` - Update vehicle (Manager only)
- `DELETE /api/vehicles/:id` - Delete vehicle (Manager only)
- `PATCH /api/vehicles/:id/toggle-service` - Toggle out of service status (Manager only)

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create trip (Dispatcher only)
- `PATCH /api/trips/:id/status` - Update trip status (Dispatcher only)

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `GET /api/maintenance/:id` - Get single maintenance record
- `POST /api/maintenance` - Create maintenance record (Manager only)
- `PUT /api/maintenance/:id` - Update maintenance record (Manager only)
- `DELETE /api/maintenance/:id` - Delete maintenance record (Manager only)

### Fuel & Expenses
- `GET /api/fuel` - Get all fuel expenses
- `GET /api/fuel/:id` - Get single fuel expense
- `POST /api/fuel` - Create fuel expense (Dispatcher/Financial Analyst)
- `PUT /api/fuel/:id` - Update fuel expense (Dispatcher/Financial Analyst)
- `DELETE /api/fuel/:id` - Delete fuel expense (Dispatcher/Financial Analyst)

### Analytics
- `GET /api/analytics/dashboard-kpis` - Get dashboard KPIs
- `GET /api/analytics/vehicle-roi` - Get vehicle ROI analysis
- `GET /api/analytics/fuel-efficiency` - Get fuel efficiency report
- `GET /api/analytics/driver-performance` - Get driver performance report
- `GET /api/analytics/monthly-costs` - Get monthly operational costs
- `GET /api/analytics/trip-summary` - Get trip summary statistics

## Hardcoded Login Credentials

The backend includes hardcoded credentials for testing:

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetflow.com | manager123 |
| Dispatcher | dispatcher@fleetflow.com | dispatcher123 |
| Safety Officer | safety@fleetflow.com | safety123 |
| Financial Analyst | finance@fleetflow.com | finance123 |

## Testing the API

Use tools like Postman, Insomnia, or curl to test endpoints.

### Example Login Request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@fleetflow.com","password":"manager123"}'
```

### Example Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "manager@fleetflow.com",
    "email": "manager@fleetflow.com",
    "name": "Manager Account",
    "role": "manager"
  }
}
```

## Authentication

All API endpoints (except login and health check) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control (RBAC)

- **Manager**: Can manage vehicles, maintenance, view analytics
- **Dispatcher**: Can create and manage trips, log fuel expenses
- **Safety Officer**: Can view driver safety scores and compliance
- **Financial Analyst**: Can view financial reports and logs expenses
- **Driver**: Can be assigned to trips and view their performance

## MongoDB Database Structure

### Users Collection
- Stores user accounts with roles
- Tracks driver license expiry and safety scores

### Vehicles Collection
- Stores vehicle information
- Tracks status (available, on_trip, in_shop, out_of_service)
- Maintains total fuel and maintenance costs

### Trips Collection
- Stores trip information
- References vehicle and driver
- Tracks trip status and distance

### Maintenance Collection
- Stores maintenance/service records
- Tracks service dates and costs

### FuelExpense Collection
- Stores fuel fill-up records
- Tracks cost per liter and total cost

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For local MongoDB: `mongodb://localhost:27017/fleetflow`
- For Atlas: Ensure IP whitelist includes your IP address

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 5000

### JWT Errors
- Ensure JWT_SECRET is set in .env file
- Token expires after 24 hours - login again to get new token

### CORS Errors
- Ensure frontend URL is properly configured
- CORS is enabled for all origins in this setup (change for production)

## Production Considerations

1. Change JWT_SECRET to a strong random string
2. Use MongoDB Atlas instead of local MongoDB
3. Add rate limiting
4. Implement proper error logging
5. Use environment-specific configurations
6. Add request validation
7. Implement API rate limiting
8. Add data encryption for sensitive fields
