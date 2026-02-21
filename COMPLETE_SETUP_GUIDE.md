# FleetFlow - Complete Setup & Installation Guide

## Overview
FleetFlow is a comprehensive Fleet & Logistics Management System built with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Next.js + React + Tailwind CSS + shadcn/ui
- **Database**: MongoDB (Local or Atlas)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Installation](#backend-installation)
4. [Frontend Installation](#frontend-installation)
5. [Running the Application](#running-the-application)
6. [Testing the System](#testing-the-system)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v14 or higher (v16+ recommended)
- **npm**: v6 or higher (or pnpm/yarn)
- **MongoDB**: v4.4 or higher
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 1GB

### Check Your Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB (if installed locally)
mongod --version
```

---

## MongoDB Setup

### Option A: Local MongoDB Installation

#### Windows
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start as a service automatically
4. Default connection: `mongodb://localhost:27017`

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
```

#### Verify MongoDB is Running
```bash
# Test connection
mongosh
# Type: exit
```

### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Sign Up" and create account

2. **Create Free Cluster**:
   - Click "Create" button
   - Choose "Free" tier
   - Select your preferred region
   - Click "Create Cluster"
   - Wait for cluster to deploy (5-10 minutes)

3. **Create Database User**:
   - Go to "Database Access" tab
   - Click "Add New Database User"
   - Enter username and password (save these!)
   - Select "Specific Roles" → "Atlas Admin"
   - Click "Add User"

4. **Whitelist IP**:
   - Go to "Network Access" tab
   - Click "Add IP Address"
   - Select "Allow access from anywhere" for development
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Clusters" tab
   - Click "Connect" button
   - Select "Connect Your Application"
   - Copy the connection string
   - Replace `<password>` with your user password

Example Connection String:
```
mongodb+srv://username:password@cluster.mongodb.net/fleetflow
```

---

## Backend Installation

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

Dependencies installed:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `nodemon` - Development auto-restart (dev only)

### Step 3: Create/Update .env File
```bash
# Edit .env file or create new one
MONGODB_URI=mongodb://localhost:27017/fleetflow
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fleetflow
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### Step 4: Verify Backend Structure
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
├── server.js
├── package.json
├── .env
└── SETUP_GUIDE.md
```

### Step 5: Start Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Expected output:
# FleetFlow Backend running on port 5000
# MongoDB connected successfully
```

**Keep this terminal open. You'll need it running for the frontend.**

---

## Frontend Installation

### Step 1: Open New Terminal & Navigate to Root
```bash
# In a new terminal window/tab
cd /path/to/fleetflow  # Go to root directory
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

Key dependencies:
- `next` - React framework
- `react` - UI library
- `tailwindcss` - CSS framework
- `shadcn/ui` - Component library
- `lucide-react` - Icons

### Step 3: Check Environment Configuration
The `.env.local` file should have:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This tells the frontend where to find the backend.

### Step 4: Verify Frontend Structure
```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── vehicles/
│   │   ├── trips/
│   │   ├── maintenance/
│   │   ├── fuel/
│   │   ├── analytics/
│   │   ├── drivers/
│   │   └── settings/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── ui/ (shadcn components)
├── lib/
│   └── utils.ts
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

### Step 5: Start Frontend Development Server
```bash
npm run dev

# Expected output:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
# ✓ Ready in 3.2s
```

---

## Running the Application

### Terminal 1: Backend (Keep Running)
```bash
cd backend
npm run dev
# Wait for: "MongoDB connected successfully"
```

### Terminal 2: Frontend (New Terminal)
```bash
cd .  # root directory
npm run dev
# Wait for: "Ready in X.Xs"
```

### Terminal 3: (Optional) MongoDB Shell
```bash
mongosh
# For Atlas: mongosh "mongodb+srv://username:password@cluster.mongodb.net/fleetflow"
```

---

## Testing the System

### Step 1: Open Application
1. Open browser
2. Go to: **http://localhost:3000**
3. You should see the Login page

### Step 2: Login
Use demo credentials:

**Manager Account**
- Email: `manager@fleetflow.com`
- Password: `manager123`

**Dispatcher Account**
- Email: `dispatcher@fleetflow.com`
- Password: `dispatcher123`

**Safety Officer Account**
- Email: `safety@fleetflow.com`
- Password: `safety123`

**Financial Analyst Account**
- Email: `finance@fleetflow.com`
- Password: `finance123`

### Step 3: Explore Features
- **Dashboard**: View KPIs and fleet status
- **Vehicles**: Add/view vehicle inventory
- **Trips**: Create and manage shipments
- **Maintenance**: Log service records
- **Fuel**: Track fuel expenses
- **Analytics**: View reports and metrics
- **Drivers**: Monitor driver performance
- **Settings**: Account and system info

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

### Main Endpoints

#### Authentication
```
POST   /auth/login              - Login with email/password
GET    /auth/credentials        - Get demo credentials
```

#### Vehicles
```
GET    /vehicles                - List all vehicles
GET    /vehicles/:id            - Get single vehicle
POST   /vehicles                - Create vehicle (Manager only)
PUT    /vehicles/:id            - Update vehicle (Manager only)
DELETE /vehicles/:id            - Delete vehicle (Manager only)
PATCH  /vehicles/:id/toggle-service - Toggle out of service
```

#### Trips
```
GET    /trips                   - List all trips
GET    /trips/:id               - Get single trip
POST   /trips                   - Create trip (Dispatcher only)
PATCH  /trips/:id/status        - Update trip status
```

#### Maintenance
```
GET    /maintenance             - List maintenance records
GET    /maintenance/:id         - Get single record
POST   /maintenance             - Create record (Manager only)
PUT    /maintenance/:id         - Update record (Manager only)
DELETE /maintenance/:id         - Delete record (Manager only)
```

#### Fuel Expenses
```
GET    /fuel                    - List fuel expenses
GET    /fuel/:id                - Get single expense
POST   /fuel                    - Create expense (Dispatcher/Analyst)
PUT    /fuel/:id                - Update expense
DELETE /fuel/:id                - Delete expense
```

#### Analytics
```
GET    /analytics/dashboard-kpis    - Dashboard KPIs
GET    /analytics/vehicle-roi       - Vehicle ROI analysis
GET    /analytics/fuel-efficiency   - Fuel efficiency report
GET    /analytics/driver-performance - Driver performance
GET    /analytics/monthly-costs     - Monthly cost report
GET    /analytics/trip-summary      - Trip statistics
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  role: ['manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'driver'],
  status: ['active', 'inactive', 'suspended'],
  licenseNumber: String,
  licenseExpiry: Date,
  safetyScore: Number (default: 100),
  tripsCompleted: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicles Collection
```javascript
{
  _id: ObjectId,
  name: String,
  licensePlate: String (unique),
  model: String,
  type: ['truck', 'van', 'bike'],
  maxLoadCapacity: Number (kg),
  currentOdometer: Number,
  status: ['available', 'on_trip', 'in_shop', 'out_of_service'],
  region: String,
  acquisitionCost: Number,
  totalFuelCost: Number (default: 0),
  totalMaintenanceCost: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Trips Collection
```javascript
{
  _id: ObjectId,
  tripId: String (unique),
  vehicleId: ObjectId (ref: Vehicle),
  driverId: ObjectId (ref: User),
  cargoWeight: Number,
  cargoDescription: String,
  startLocation: String,
  endLocation: String,
  startOdometer: Number,
  endOdometer: Number,
  status: ['draft', 'dispatched', 'completed', 'cancelled'],
  startTime: Date,
  endTime: Date,
  totalDistance: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Maintenance Collection
```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId (ref: Vehicle),
  serviceType: String,
  cost: Number,
  description: String,
  serviceDate: Date,
  nextServiceDate: Date,
  status: ['scheduled', 'completed', 'cancelled'],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### FuelExpense Collection
```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId (ref: Vehicle),
  tripId: ObjectId (ref: Trip),
  liters: Number,
  cost: Number,
  costPerLiter: Number,
  fuelDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**:
- Make sure MongoDB is running: `mongod` (local) or check Atlas dashboard
- Verify MONGODB_URI in .env
- For Atlas, ensure IP whitelist includes your IP

#### Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
```bash
# Change PORT in .env to 5001, 5002, etc.
# Or kill the process:
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9
```

#### JWT_SECRET Missing
```
Error: JWT_SECRET is not defined
```
**Solution**:
- Add JWT_SECRET to .env file

### Frontend Issues

#### Backend Connection Error
```
Failed to fetch: http://localhost:5000/api/...
```
**Solution**:
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

#### Blank Page After Login
**Solution**:
- Clear browser cache and localStorage
- Check browser console for JavaScript errors
- Verify backend API is responding

#### Module Not Found
```
Error: Module not found: 'lucide-react'
```
**Solution**:
```bash
npm install lucide-react
```

### General Issues

#### Port Already in Use
**Frontend** (port 3000):
```bash
# Kill process or change port
npm run dev -- -p 3001
```

#### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Errors
**Solution**: Backend is configured with CORS enabled. If issues persist:
```javascript
// In backend server.js:
app.use(cors()); // Already included
```

---

## Performance Tips

1. **Use MongoDB Atlas** for production
2. **Enable compression** in Express
3. **Add rate limiting** for API endpoints
4. **Use caching** for analytics queries
5. **Optimize images** in frontend
6. **Enable HTTP/2** for faster loading

---

## Security Considerations

⚠️ **Before Production Deployment**:

1. **Change JWT_SECRET** to a strong random string
2. **Use HTTPS** instead of HTTP
3. **Implement input validation** on all endpoints
4. **Add CORS whitelisting** for specific domains
5. **Use environment variables** for sensitive data
6. **Enable MongoDB authentication** with strong passwords
7. **Implement API rate limiting**
8. **Add request logging** for audit trails
9. **Use secure cookies** for auth tokens
10. **Regular security audits**

---

## Production Deployment

### Frontend Deployment (Vercel Recommended)
```bash
npm run build
npm run start
```

### Backend Deployment Options
- **Heroku**: Free tier (limited)
- **Railway**: Simple deployment
- **AWS EC2**: Full control
- **DigitalOcean**: Affordable VPS
- **Render**: Easy deployment

---

## Support & Documentation

### Important Files
- `backend/SETUP_GUIDE.md` - Backend detailed guide
- `FRONTEND_SETUP.md` - Frontend detailed guide
- `README.md` - Project overview

### Getting Help
1. Check error messages in console
2. Review the detailed setup guides
3. Verify all prerequisites are installed
4. Check if backend/frontend are running
5. Verify network connectivity

---

## Summary

```
✓ MongoDB running (local or Atlas)
✓ Backend running on port 5000
✓ Frontend running on port 3000
✓ Can login with demo credentials
✓ Can view dashboard and data
✓ Ready to develop/deploy
```

**Congratulations! FleetFlow is ready to use!**

For detailed information on specific components, refer to:
- Backend: `/backend/SETUP_GUIDE.md`
- Frontend: `/FRONTEND_SETUP.md`
