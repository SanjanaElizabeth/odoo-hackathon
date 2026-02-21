# FleetFlow Frontend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or pnpm package manager
- Backend server running on port 5000

## Project Structure

```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Command center/main dashboard
│   │   ├── vehicles/
│   │   │   └── page.tsx          # Vehicle registry
│   │   ├── trips/
│   │   │   └── page.tsx          # Trip dispatcher
│   │   ├── maintenance/
│   │   │   └── page.tsx          # Maintenance logs
│   │   ├── fuel/
│   │   │   └── page.tsx          # Fuel expenses
│   │   ├── analytics/
│   │   │   └── page.tsx          # Analytics & reports
│   │   ├── drivers/
│   │   │   └── page.tsx          # Driver profiles
│   │   └── settings/
│   │       └── page.tsx          # Settings page
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/
│   └── ui/                       # shadcn/ui components
├── lib/
│   └── utils.ts                  # Utility functions
├── .env.local                    # Environment variables
├── package.json
├── next.config.mjs
├── tsconfig.json
└── tailwind.config.ts
```

## Step 1: Install Dependencies

```bash
npm install
# or
pnpm install
```

This installs:
- `next` - React framework
- `react` & `react-dom` - React libraries
- `typescript` - Type safety
- `tailwindcss` - CSS utility framework
- `shadcn/ui` - UI component library
- `lucide-react` - Icon library

## Step 2: Configure Environment Variables

Update `.env.local` file with your backend URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Important Notes:
- Change `http://localhost:5000` if your backend is on a different host/port
- The `NEXT_PUBLIC_` prefix makes this variable accessible in the browser
- Do not commit `.env.local` to version control (it's for local development)

## Step 3: Ensure Backend is Running

Before starting the frontend, make sure your backend server is running:

```bash
cd backend
npm run dev
# Expected output: "FleetFlow Backend running on port 5000"
```

## Step 4: Start the Frontend Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Step 5: Login to the Application

1. Navigate to http://localhost:3000/login
2. Use one of the demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetflow.com | manager123 |
| Dispatcher | dispatcher@fleetflow.com | dispatcher123 |
| Safety Officer | safety@fleetflow.com | safety123 |
| Financial Analyst | finance@fleetflow.com | finance123 |

3. After login, you'll be redirected to the dashboard

## Page Overview

### 1. Login Page (`/login`)
- Email/password authentication
- Demo credentials displayed for easy testing
- Role-based access control
- Token-based JWT authentication

### 2. Command Center (`/dashboard`)
- High-level fleet overview with KPIs
- Active fleet count
- Maintenance alerts
- Fleet utilization rate
- Pending cargo tracking

### 3. Vehicle Registry (`/dashboard/vehicles`)
- View all vehicles in the fleet
- Filter by type and status
- Add, edit, and delete vehicles
- Track odometer readings
- Monitor fuel and maintenance costs

### 4. Trip Dispatcher (`/dashboard/trips`)
- Create and manage trips/shipments
- Assign vehicles and drivers
- Track trip status (draft, dispatched, completed, cancelled)
- Validate cargo weight against vehicle capacity
- Monitor trip routes and driver assignments

### 5. Maintenance Logs (`/dashboard/maintenance`)
- Log maintenance and service records
- Track service costs
- Monitor vehicle health
- Schedule preventative maintenance
- Status tracking (scheduled, completed, cancelled)

### 6. Fuel Expenses (`/dashboard/fuel`)
- Log fuel fill-ups with cost tracking
- Monitor fuel efficiency
- Track cost per liter
- Link expenses to trips
- Calculate average fuel costs

### 7. Analytics & Reports (`/dashboard/analytics`)
- Vehicle ROI analysis
- Fleet-wide cost analysis
- Fuel efficiency metrics
- Trip completion statistics
- Total distance traveled
- Monthly operational cost reports

### 8. Driver Profiles (`/dashboard/drivers`)
- View all drivers in the system
- Monitor safety scores
- Track license expiry dates
- View completed trips per driver
- Check driver compliance status

### 9. Settings (`/dashboard/settings`)
- View account information
- API configuration settings
- System information
- Logout option

## Features

### Authentication
- JWT-based authentication with 24-hour token expiry
- Role-based access control (Manager, Dispatcher, Safety Officer, Financial Analyst, Driver)
- Secure token storage in localStorage
- Automatic logout on token expiration

### Dashboard Features
- Real-time KPI updates
- Responsive design (mobile, tablet, desktop)
- Dark theme with slate color scheme
- Filter and search functionality
- Data tables with sorting

### API Integration
- Fetch data from backend API
- Error handling and user feedback
- Loading states for better UX
- Token-based API requests

## Building for Production

```bash
npm run build
npm run start
```

## Environment-Specific Configuration

### Development
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development
```

### Production
```
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NODE_ENV=production
```

## Common Issues & Solutions

### Backend Connection Error
**Error**: "Failed to fetch" or "API connection refused"

**Solution**:
1. Ensure backend server is running: `npm run dev` in backend folder
2. Check backend port (should be 5000)
3. Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
4. Check CORS configuration in backend

### CORS Errors
**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
- Backend has CORS enabled for all origins
- Ensure `http://localhost:3000` is accessible
- For production, configure CORS properly in backend

### Token Expired
**Error**: "Unauthorized" or "Invalid token"

**Solution**:
- Login again to get a new token
- Tokens expire after 24 hours
- Token is stored in localStorage

### Blank Page or 404 Errors
**Error**: Page not loading

**Solution**:
1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Check console for error messages
4. Ensure all files are in correct directories

## Development Tips

### Using localStorage
```typescript
// Store token
localStorage.setItem('token', token);

// Retrieve token
const token = localStorage.getItem('token');

// Clear data
localStorage.removeItem('token');
```

### Making API Requests
```typescript
const token = localStorage.getItem('token');
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Adding New Pages
1. Create folder in `app/dashboard/` (e.g., `new-page`)
2. Create `page.tsx` file inside
3. Use the layout from parent `layout.tsx`
4. Update navigation in `app/dashboard/layout.tsx`

### Styling
- Uses Tailwind CSS utility classes
- Dark theme with slate colors
- Responsive design with mobile-first approach
- shadcn/ui components for consistency

## File Sizes & Performance

The application includes:
- Optimized bundle size
- Code splitting for better performance
- Image optimization
- CSS minification

## Support

For issues or questions:
1. Check the error messages in browser console
2. Verify backend is running and accessible
3. Check network tab in DevTools
4. Review logs in browser and backend terminal

## Next Steps

1. Customize branding and colors in `tailwind.config.ts`
2. Add real MongoDB data
3. Implement additional features as needed
4. Deploy to production (Vercel recommended)
5. Configure domain and SSL certificate
6. Setup monitoring and logging
