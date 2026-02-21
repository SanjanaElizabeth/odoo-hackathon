'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Wrench, TrendingUp, Package, CheckCircle, AlertTriangle, DollarSign, Users, Fuel } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface DashboardStats {
  totalVehicles: number;
  activeFleet: number;
  maintenanceAlerts: number;
  availableVehicles: number;
  pendingCargo: number;
  utilizationRate: string;
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  cancelledTrips: number;
  completionRate: string;
  totalDrivers: number;
  onDutyDrivers: number;
  suspendedDrivers: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalDistance: number;
  avgSafetyScore: string;
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>('Manager');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUserRole(role);
    setMounted(true);
  }, []);

  const { data: stats, isLoading } = useSWR<DashboardStats>('/api/analytics/dashboard', fetcher, { refreshInterval: 10000 });

  if (!mounted || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6"><div className="text-center text-slate-400">Failed to load dashboard data.</div></div>;
  }

  switch (userRole) {
    case 'Manager':
      return <ManagerDashboard stats={stats} />;
    case 'Dispatcher':
      return <DispatcherDashboard stats={stats} />;
    case 'Safety Officer':
      return <SafetyOfficerDashboard stats={stats} />;
    case 'Financial Analyst':
      return <FinancialAnalystDashboard stats={stats} />;
    default:
      return <ManagerDashboard stats={stats} />;
  }
}

function ManagerDashboard({ stats }: { stats: DashboardStats }) {
  const vehicleStatus = [
    { name: 'Available', value: stats.availableVehicles, fill: '#10b981' },
    { name: 'On Trip', value: stats.activeFleet, fill: '#3b82f6' },
    { name: 'Maintenance', value: stats.maintenanceAlerts, fill: '#f97316' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fleet Manager Dashboard</h1>
        <p className="text-slate-400">Manage vehicles, maintenance, and fleet performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalVehicles}</div>
            <p className="text-xs text-slate-400 mt-1">Complete fleet size</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Fleet</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeFleet}</div>
            <p className="text-xs text-slate-400 mt-1">Vehicles on trip</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Maintenance Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.maintenanceAlerts}</div>
            <p className="text-xs text-slate-400 mt-1">Vehicles in shop</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.utilizationRate}</div>
            <p className="text-xs text-slate-400 mt-1">Fleet efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Vehicle Status Distribution</CardTitle>
            <CardDescription>Current fleet breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={vehicleStatus} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {vehicleStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Cost Monitoring</CardTitle>
            <CardDescription>Current operational expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Fuel Cost</span>
              <span className="text-xl font-bold text-green-400">${stats.totalFuelCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Maintenance Cost</span>
              <span className="text-xl font-bold text-orange-400">${stats.totalMaintenanceCost.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-slate-300 font-medium">Total Operational Cost</span>
              <span className="text-2xl font-bold text-white">${(stats.totalFuelCost + stats.totalMaintenanceCost).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current vehicle distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-300">Available</span><span className="font-semibold text-green-400">{stats.availableVehicles}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">On Trip</span><span className="font-semibold text-blue-400">{stats.activeFleet}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">In Maintenance</span><span className="font-semibold text-orange-400">{stats.maintenanceAlerts}</span></div>
            <div className="flex justify-between pt-3 border-t border-slate-700"><span className="text-slate-300 font-medium">Total Fleet</span><span className="font-bold text-white">{stats.totalVehicles}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">API Server</span><span className="text-green-400">Online</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Database</span><span className="text-green-400">Connected</span></div>
            <div className="flex justify-between"><span className="text-slate-400">GPS Tracking</span><span className="text-green-400">Active</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Analytics Engine</span><span className="text-green-400">Running</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DispatcherDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dispatcher Dashboard</h1>
        <p className="text-slate-400">Daily delivery operations, assignments, and real-time monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Trips</CardTitle>
            <Truck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeTrips}</div>
            <p className="text-xs text-slate-400 mt-1">Currently dispatched</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Draft Trips</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingCargo}</div>
            <p className="text-xs text-slate-400 mt-1">Awaiting dispatch</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Available Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.availableVehicles}</div>
            <p className="text-xs text-slate-400 mt-1">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Available Drivers</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.onDutyDrivers}</div>
            <p className="text-xs text-slate-400 mt-1">On duty</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
            <CardDescription>Overall trip metrics from database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-300">Total Trips</span><span className="font-bold text-white">{stats.totalTrips}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">Completed</span><span className="font-bold text-green-400">{stats.completedTrips}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">Cancelled</span><span className="font-bold text-red-400">{stats.cancelledTrips}</span></div>
            <div className="flex justify-between pt-3 border-t border-slate-700"><span className="text-slate-300 font-medium">Completion Rate</span><span className="font-bold text-blue-400">{stats.completionRate}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Trip Lifecycle</CardTitle>
            <CardDescription>Status flow for all trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-600 rounded-lg"><div className="h-2.5 w-2.5 rounded-full bg-slate-400" /><span className="text-sm text-slate-200">Draft</span></div>
              <span className="text-slate-500">{'>'}</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/50 rounded-lg"><div className="h-2.5 w-2.5 rounded-full bg-blue-400" /><span className="text-sm text-blue-200">Dispatched</span></div>
              <span className="text-slate-500">{'>'}</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900/50 rounded-lg"><div className="h-2.5 w-2.5 rounded-full bg-green-400" /><span className="text-sm text-green-200">Completed</span></div>
              <span className="text-slate-500 mx-2">|</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900/50 rounded-lg"><div className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="text-sm text-red-200">Cancelled</span></div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">On completion or cancellation, assigned vehicle and driver are automatically released.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SafetyOfficerDashboard({ stats }: { stats: DashboardStats }) {
  const { data: drivers = [] } = useSWR('/api/drivers', fetcher);

  const getLicenseLabel = (expiry: string) => {
    const days = Math.floor((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Expired', color: 'bg-red-900/60 text-red-200' };
    if (days < 30) return { label: 'Expiring', color: 'bg-yellow-900/60 text-yellow-200' };
    return { label: 'Valid', color: 'bg-green-900/60 text-green-200' };
  };

  const getStatusColor = (status: string) => {
    if (status === 'on_duty') return 'bg-green-900/60 text-green-200';
    if (status === 'off_duty') return 'bg-slate-600 text-slate-200';
    return 'bg-red-900/60 text-red-200';
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const expiredCount = drivers.filter((d: { licenseExpiry: string }) => getLicenseLabel(d.licenseExpiry).label === 'Expired').length;
  const expiringCount = drivers.filter((d: { licenseExpiry: string }) => getLicenseLabel(d.licenseExpiry).label === 'Expiring').length;

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Safety Officer Dashboard</h1>
        <p className="text-slate-400">Driver safety, license compliance, and risk prevention</p>
      </div>

      {expiredCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">{expiredCount} expired license{expiredCount > 1 ? 's' : ''} -- Assignment blocked</p>
            <p className="text-xs text-red-400/70 mt-0.5">These drivers cannot be assigned to trips until licenses are renewed.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">Total Drivers</p><p className="text-2xl font-bold text-white">{stats.totalDrivers}</p></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">On Duty</p><p className="text-2xl font-bold text-green-400">{stats.onDutyDrivers}</p></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">Suspended</p><p className="text-2xl font-bold text-red-400">{stats.suspendedDrivers}</p></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">Expired License</p><p className="text-2xl font-bold text-red-400">{expiredCount}</p></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">Avg Safety</p><p className="text-2xl font-bold text-white">{stats.avgSafetyScore}</p></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="py-4 px-4"><p className="text-xs text-slate-400">Completion Rate</p><p className="text-2xl font-bold text-white">{stats.completionRate}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader><CardTitle>License Verification Status</CardTitle><CardDescription>Drivers with expired licenses are blocked from assignment</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /><span className="text-slate-300">Valid Licenses</span></div>
              <span className="font-bold text-green-400">{drivers.length - expiredCount - expiringCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /><span className="text-slate-300">Expiring Soon (30 days)</span></div>
              <span className="font-bold text-yellow-400">{expiringCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /><span className="text-slate-300">{'Expired -- Blocked'}</span></div>
              <span className="font-bold text-red-400">{expiredCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader><CardTitle>Driver Performance</CardTitle><CardDescription>Safety scores sorted worst-first</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {[...drivers].sort((a: { safetyScore: number }, b: { safetyScore: number }) => a.safetyScore - b.safetyScore).map((driver: { _id: string; name: string; licenseExpiry: string; status: string; safetyScore: number; tripsCompleted: number; tripsAssigned: number }) => {
                const license = getLicenseLabel(driver.licenseExpiry);
                const isHighRisk = license.label === 'Expired' || driver.safetyScore < 70 || driver.status === 'suspended';
                return (
                  <div key={driver._id} className={`flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg ${isHighRisk ? 'border-l-2 border-l-red-500' : ''}`}>
                    <div className="flex-1 min-w-0"><p className="font-medium text-white text-sm truncate">{driver.name}</p></div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${license.color}`}>{license.label}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(driver.status)}`}>{driver.status.replace('_', ' ')}</span>
                    <span className={`text-sm font-bold ${getSafetyColor(driver.safetyScore)}`}>{driver.safetyScore}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialAnalystDashboard({ stats }: { stats: DashboardStats }) {
  const { data: fuelExpenses = [] } = useSWR('/api/fuel', fetcher);
  const { data: maintenanceRecords = [] } = useSWR('/api/maintenance', fetcher);

  const totalFuel = stats.totalFuelCost;
  const totalMaint = stats.totalMaintenanceCost;
  const totalOp = totalFuel + totalMaint;
  const totalLiters = fuelExpenses.reduce((s: number, e: { liters: number }) => s + e.liters, 0);
  const totalKm = fuelExpenses.reduce((s: number, e: { km: number }) => s + e.km, 0);
  const avgEfficiency = totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : '0.0';

  const costDistribution = [
    { name: 'Fuel', value: totalFuel, fill: '#10b981' },
    { name: 'Maintenance', value: totalMaint, fill: '#f97316' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Analyst Dashboard</h1>
        <p className="text-slate-400">Cost tracking, profitability analysis, fuel efficiency</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-300">Total Fuel Cost</CardTitle><Fuel className="h-4 w-4 text-green-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">${totalFuel.toLocaleString()}</div><p className="text-xs text-slate-400 mt-1">{totalLiters.toLocaleString()} liters consumed</p></CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-300">Total Maintenance</CardTitle><Wrench className="h-4 w-4 text-orange-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">${totalMaint.toLocaleString()}</div><p className="text-xs text-slate-400 mt-1">{maintenanceRecords.length} service records</p></CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-300">Total Operational Cost</CardTitle><DollarSign className="h-4 w-4 text-blue-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">${totalOp.toLocaleString()}</div><p className="text-xs text-slate-400 mt-1">Fuel + Maintenance</p></CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-300">Avg Fuel Efficiency</CardTitle><TrendingUp className="h-4 w-4 text-green-400" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-white">{avgEfficiency} km/L</div><p className="text-xs text-slate-400 mt-1">{totalKm.toLocaleString()} km driven</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader><CardTitle className="text-white">Cost Breakdown</CardTitle><CardDescription>Fuel vs Maintenance split</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={costDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ name, value }) => `${name}: $${value.toLocaleString()}`} dataKey="value">
                  {costDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500" /><span className="text-xs text-slate-400">Fuel ({totalOp > 0 ? ((totalFuel / totalOp) * 100).toFixed(0) : 0}%)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-orange-500" /><span className="text-xs text-slate-400">Maintenance ({totalOp > 0 ? ((totalMaint / totalOp) * 100).toFixed(0) : 0}%)</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader><CardTitle className="text-white">Fleet Summary</CardTitle><CardDescription>Key operational metrics</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Total Vehicles</span><span className="font-bold text-white">{stats.totalVehicles}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Trips</span><span className="font-bold text-white">{stats.totalTrips}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Completed Trips</span><span className="font-bold text-green-400">{stats.completedTrips}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Total Distance</span><span className="font-bold text-blue-400">{stats.totalDistance.toLocaleString()} km</span></div>
            <div className="flex justify-between pt-3 border-t border-slate-700"><span className="text-slate-300 font-medium">Cost per Km</span><span className="font-bold text-white">${stats.totalDistance > 0 ? (totalOp / stats.totalDistance).toFixed(2) : '0.00'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
