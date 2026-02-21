# Role-Based Dashboard Routing

## Overview
Each user role now sees their own specific dashboard when logging in. The system uses sessionStorage to track the user's role and route them to the appropriate dashboard view.

## Roles and Their Dashboards

### 1. **Fleet Manager** (manager@fleetflow.com)
- **Dashboard**: ManagerDashboard
- **Features**:
  - Total Vehicles: 24
  - Active Fleet: 18
  - Maintenance Alerts: 2
  - Utilization Rate: 82%
  - Vehicle Status Distribution (Pie Chart)
  - Maintenance Trends (Bar Chart)
  - Cost Monitoring (Fuel & Maintenance)
  - Recent Maintenance Records

### 2. **Dispatcher** (dispatcher@fleetflow.com)
- **Dashboard**: DispatcherDashboard
- **Features**:
  - Active Trips: 8
  - Available Vehicles: 6
  - Pending Assignments: 3
  - Active Trips List
  - Weekly Trip Performance (Bar Chart)
  - Trip Status Tracking (In Transit, Dispatched, Completed)

### 3. **Safety Officer** (safety@fleetflow.com)
- **Dashboard**: SafetyOfficerDashboard
- **Features**:
  - Driver Compliance Monitoring
  - License Verification Status
  - Safety Score Tracking
  - Driver Status Management (On Duty, Off Duty, Suspended)
  - Compliance Data & Reports
  - Safety Incident Tracking

### 4. **Financial Analyst** (finance@fleetflow.com)
- **Dashboard**: FinancialAnalystDashboard
- **Features**:
  - Expense Tracking (Fuel + Maintenance)
  - Cost per Vehicle Analysis
  - Total Operational Cost Calculation
  - Monthly Expense Charts
  - ROI Analysis
  - Financial Performance Metrics

## Technical Implementation

### Login Flow
1. User enters credentials (email + password)
2. System validates against demo users
3. **User role is stored in sessionStorage** as `userRole`
4. **User email is stored in sessionStorage** as `userEmail`
5. User is redirected to `/dashboard`

### Dashboard Routing
1. DashboardPage component reads `userRole` from sessionStorage
2. Based on the role value, it renders the appropriate dashboard:
   - "Manager" → ManagerDashboard
   - "Dispatcher" → DispatcherDashboard
   - "Safety Officer" → SafetyOfficerDashboard
   - "Financial Analyst" → FinancialAnalystDashboard

### Header Display
1. Layout component reads `userEmail` and `userRole` from sessionStorage
2. Displays the current user's email and role in the header
3. Logout button clears both sessionStorage values and redirects to login

### Settings Page
1. Displays the logged-in user's actual email and role
2. Shows role-specific name mapping
3. Logout button properly clears session data

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | manager@fleetflow.com | manager123 |
| Dispatcher | dispatcher@fleetflow.com | dispatcher123 |
| Safety Officer | safety@fleetflow.com | safety123 |
| Financial Analyst | finance@fleetflow.com | finance123 |

## How to Test

1. Go to `/login`
2. Select any demo user role
3. Click "Sign In"
4. Verify you see the correct role-specific dashboard
5. Go to Settings to verify your role is displayed
6. Click Logout and verify you're returned to login page
7. Try logging in as a different role to see their unique dashboard

## Files Modified

- `/app/login/page.tsx` - Added sessionStorage storage for role and email
- `/app/dashboard/page.tsx` - Added role-based routing logic
- `/app/dashboard/layout.tsx` - Updated to read and display user role from sessionStorage
- `/app/dashboard/settings/page.tsx` - Updated to display actual user role and email

All dashboards use mock data and require no backend API calls.
