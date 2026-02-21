# FleetFlow - Fleet & Logistics Management System

A comprehensive digital fleet management solution built with Next.js, Express.js, and MongoDB.

## 🚀 Overview

FleetFlow is a centralized, rule-based digital hub designed to replace inefficient manual logbooks and optimize the complete lifecycle of a delivery fleet while monitoring driver safety and tracking financial performance.

## ✨ Key Features

### Fleet Management
- **Vehicle Registry**: Complete CRUD operations for fleet assets with real-time status tracking
- **Smart Dispatch**: Intelligent trip creation with capacity validation and driver assignment
- **Real-time Status**: Track vehicle status (Available, On Trip, In Shop, Out of Service)
- **Odometer Tracking**: Monitor vehicle mileage and operational history

### Operations
- **Trip Management**: Create, dispatch, and complete shipments with full lifecycle tracking
- **Maintenance Logs**: Schedule and track preventative and reactive maintenance
- **Fuel Tracking**: Log fuel consumption and costs per vehicle
- **Dynamic Status Updates**: Automatic vehicle status changes based on operations

### Compliance & Safety
- **Driver Profiles**: Track driver licenses, safety scores, and performance metrics
- **License Expiry**: Automatic compliance alerts for expired driver licenses
- **Safety Scoring**: Monitor driver performance and compliance records
- **Audit Trail**: Complete operational history for all transactions

### Analytics & Reports
- **Dashboard KPIs**: Real-time metrics for fleet health and utilization
- **Vehicle ROI Analysis**: Calculate return on investment for each vehicle
- **Fuel Efficiency Reports**: Monitor fuel consumption trends
- **Financial Analytics**: Monthly operational cost reports and budget tracking
- **Driver Performance**: Detailed driver metrics and compliance status

### User Management
- **Role-Based Access Control**: Manager, Dispatcher, Safety Officer, Financial Analyst, Driver
- **Secure Authentication**: JWT-based token authentication with 24-hour expiration
- **Activity Tracking**: User actions logged for compliance

## 📋 System Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│  http://localhost:3000                 │
│  - Login Page                           │
│  - Dashboard & KPIs                     │
│  - Vehicle Management                   │
│  - Trip Dispatcher                      │
│  - Analytics & Reports                  │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST (JWT Auth)
┌──────────────────▼──────────────────────┐
│       Backend (Express.js)              │
│  http://localhost:5000/api              │
│  - Authentication                       │
│  - Vehicle CRUD                         │
│  - Trip Management                      │
│  - Maintenance Tracking                 │
│  - Fuel Expenses                        │
│  - Analytics Engine                     │
└──────────────────┬──────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────┐
│       Database (MongoDB)                │
│  - Users Collection                     │
│  - Vehicles Collection                  │
│  - Trips Collection                     │
│  - Maintenance Collection               │
│  - FuelExpense Collection               │
└─────────────────────────────────────────┘
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript

### Backend
- **Framework**: Express.js
- **Language**: Node.js (JavaScript/ES6+)
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: CORS, bcryptjs
- **Environment**: dotenv

### Database
- **MongoDB** (Local or Atlas Cloud)
- **Collections**: Users, Vehicles, Trips, Maintenance, FuelExpense
- **Indexes**: On email, licensePlate, vehicleId, tripId

## 📦 Project Structure

```
fleetflow/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   │   ├── vehicles/
│   │   │   ├── trips/
│   │   │   ├── maintenance/
│   │   │   ├── fuel/
│   │   │   ├── analytics/
│   │   │   ├── drivers/
│   │   │   └── settings/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   └── .env.local
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Trip.js
│   │   ├── Maintenance.js
│   │   └── FuelExpense.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── trips.js
│   │   ├── maintenance.js
│   │   ├── fuel.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── COMPLETE_SETUP_GUIDE.md
├── FRONTEND_SETUP.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ 
- MongoDB (local or Atlas)
- npm/pnpm

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env with MONGODB_URI
npm run dev
```

### 2. Frontend Setup
```bash
# In new terminal
npm install
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- API Docs: Postman/Insomnia

### 4. Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetflow.com | manager123 |
| Dispatcher | dispatcher@fleetflow.com | dispatcher123 |
| Safety Officer | safety@fleetflow.com | safety123 |
| Financial Analyst | finance@fleetflow.com | finance123 |

## 📖 Documentation

- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Full installation & configuration guide
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Frontend-specific details
- **[backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)** - Backend-specific details

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Backend validates credentials against hardcoded list
3. JWT token generated (24-hour expiration)
4. Token stored in localStorage
5. All API requests include Authorization header with token

### Protected Routes
- All dashboard routes require valid JWT token
- Invalid/expired tokens redirect to login
- Role-based access control on API endpoints

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login              Login
GET    /api/auth/credentials        Get demo credentials
```

### Vehicles
```
GET    /api/vehicles                List all
POST   /api/vehicles                Create (Manager)
GET    /api/vehicles/:id            Get one
PUT    /api/vehicles/:id            Update (Manager)
DELETE /api/vehicles/:id            Delete (Manager)
PATCH  /api/vehicles/:id/toggle-service  Toggle status
```

### Trips
```
GET    /api/trips                   List all
POST   /api/trips                   Create (Dispatcher)
GET    /api/trips/:id               Get one
PATCH  /api/trips/:id/status        Update status
```

### Maintenance
```
GET    /api/maintenance             List all
POST   /api/maintenance             Create (Manager)
GET    /api/maintenance/:id         Get one
PUT    /api/maintenance/:id         Update (Manager)
DELETE /api/maintenance/:id         Delete (Manager)
```

### Fuel Expenses
```
GET    /api/fuel                    List all
POST   /api/fuel                    Create (Dispatcher/Analyst)
GET    /api/fuel/:id                Get one
PUT    /api/fuel/:id                Update
DELETE /api/fuel/:id                Delete
```

### Analytics
```
GET    /api/analytics/dashboard-kpis
GET    /api/analytics/vehicle-roi
GET    /api/analytics/fuel-efficiency
GET    /api/analytics/driver-performance
GET    /api/analytics/monthly-costs
GET    /api/analytics/trip-summary
```

## 🔄 Core Workflows

### Vehicle Intake Workflow
1. Add vehicle (Manager) → Status: Available
2. Assign to trip (Dispatcher)
3. Vehicle status → On Trip
4. Complete trip
5. Vehicle status → Available
6. Log fuel expense
7. Schedule maintenance → Status: In Shop

### Trip Creation Workflow
1. Create trip with vehicle + driver + cargo
2. Validate: cargo weight ≤ vehicle capacity
3. Validate: driver license is valid
4. Trip status → Draft
5. Dispatch trip
6. Trip status → Dispatched, Vehicle → On Trip
7. Complete trip
8. Trip status → Completed, Vehicle → Available

### Maintenance Workflow
1. Log maintenance service (Manager)
2. Vehicle status → In Shop
3. Complete service
4. Vehicle status → Available
5. Cost automatically added to vehicle total

## 💾 Data Models

### User (Driver/Staff)
- Authentication credentials
- Role and status
- License information
- Safety metrics
- Trip history

### Vehicle
- Registration details
- Capacity and specifications
- Current status and location
- Operational costs (fuel, maintenance)
- Performance metrics

### Trip
- Origin and destination
- Assigned vehicle and driver
- Cargo details and validation
- Status tracking
- Distance and duration

### Maintenance
- Service type and date
- Associated vehicle
- Cost and status
- Scheduling information

### FuelExpense
- Liters and cost
- Associated trip
- Cost per liter calculation
- Date tracking

## 🎨 UI/UX Features

- **Responsive Design**: Mobile, tablet, and desktop support
- **Dark Theme**: Professional slate color scheme
- **Real-time KPIs**: Dashboard with live metrics
- **Data Tables**: Sortable and filterable
- **Status Badges**: Color-coded status indicators
- **Form Validation**: Client and server-side validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Clear feedback during operations

## 🔒 Security Features

- JWT-based authentication
- Password not stored (hardcoded for demo)
- CORS enabled (configurable)
- Request validation
- Role-based access control
- Secure token expiration
- Environment variable protection

## 📈 Performance

- Optimized database queries
- Efficient data pagination
- Code splitting in frontend
- Lazy loading of components
- CSS minification
- API response caching (where applicable)

## 🐛 Known Limitations

- Hardcoded demo credentials (for development)
- No email notifications
- No real-time WebSocket updates
- Single-region deployment
- No audit logging

## 🚀 Production Deployment

### Environment Changes
- Change JWT_SECRET to strong random string
- Switch to MongoDB Atlas
- Enable HTTPS
- Configure CORS for specific domains
- Add API rate limiting
- Enable request logging

### Deployment Platforms
- **Frontend**: Vercel, Netlify, AWS S3+CloudFront
- **Backend**: Heroku, Railway, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas (recommended)

## 📝 Future Enhancements

- [ ] Email notifications
- [ ] Real-time GPS tracking
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboards
- [ ] Automated report generation
- [ ] Payment integration
- [ ] Document management
- [ ] Third-party API integrations

## 🤝 Contributing

This is a demo/learning project. For modifications:
1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues or questions:
1. Check the setup guides
2. Review API documentation
3. Check browser console for errors
4. Verify backend is running
5. Check network connectivity

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Project Details

- **Created**: 2024
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: 2024

---

**FleetFlow** - Your complete fleet management solution for the modern logistics industry.

Start managing your fleet efficiently today! 🚀
