'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Truck, ShieldCheck } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ROIData {
  vehicleId: string;
  name: string;
  acquisitionCost: number;
  fuelCost: number;
  maintenanceCost: number;
  totalOperationalCost: number;
  roiPercentage: string;
}

interface TripSummary {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  cancelledTrips: number;
  completionRate: string;
  totalDistance: number;
}

const rolePageConfig: Record<string, { title: string; description: string }> = {
  Manager: { title: 'Operational Analytics & Financial Reports', description: 'Fleet performance, costs, and ROI analysis' },
  'Safety Officer': { title: 'Safety & Compliance Analytics', description: 'Driver safety metrics, compliance trends, and incident analysis' },
  'Financial Analyst': { title: 'Financial Analytics & Reports', description: 'Cost analysis, ROI, and financial performance reports' },
};

export default function AnalyticsPage() {
  const [userRole, setUserRole] = useState('Manager');
  const [mounted, setMounted] = useState(false);

  const { data: dashData } = useSWR('/api/analytics/dashboard', fetcher);
  const { data: vehicles } = useSWR('/api/vehicles', fetcher);
  const { data: trips } = useSWR('/api/trips', fetcher);
  const { data: fuelData } = useSWR('/api/fuel', fetcher);
  const { data: maintenanceData } = useSWR('/api/maintenance', fetcher);
  const { data: drivers } = useSWR('/api/drivers', fetcher);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUserRole(role);
    setMounted(true);
  }, []);

  // Build ROI data from real vehicle + fuel + maintenance data
  const roiData: ROIData[] = (vehicles || []).map((v: any) => {
    const vFuel = (fuelData || []).filter((f: any) => f.vehicleId === v.registrationNumber).reduce((s: number, f: any) => s + f.totalCost, 0);
    const vMaint = (maintenanceData || []).filter((m: any) => m.vehicleId === v.registrationNumber).reduce((s: number, m: any) => s + m.cost, 0);
    const totalOp = vFuel + vMaint;
    const acqCost = 800000; // placeholder acquisition cost
    return {
      vehicleId: v._id,
      name: v.registrationNumber,
      acquisitionCost: acqCost,
      fuelCost: vFuel,
      maintenanceCost: vMaint,
      totalOperationalCost: totalOp,
      roiPercentage: acqCost > 0 ? ((totalOp / acqCost) * 100).toFixed(0) : '0',
    };
  });

  // Build trip summary from real trips
  const allTrips = trips || [];
  const tripSummary: TripSummary = {
    totalTrips: allTrips.length,
    completedTrips: allTrips.filter((t: any) => t.status === 'Completed').length,
    activeTrips: allTrips.filter((t: any) => t.status === 'In Progress').length,
    cancelledTrips: allTrips.filter((t: any) => t.status === 'Cancelled').length,
    completionRate: allTrips.length > 0 ? ((allTrips.filter((t: any) => t.status === 'Completed').length / allTrips.length) * 100).toFixed(0) : '0',
    totalDistance: allTrips.reduce((s: number, t: any) => s + (t.distance || 0), 0),
  };

  const pageConfig = rolePageConfig[userRole] || rolePageConfig['Manager'];

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-400">Loading...</div>
      </div>
    );
  }

  if (userRole === 'Safety Officer') {
    return <SafetyAnalytics drivers={drivers || []} trips={allTrips} />;
  }

  if (userRole === 'Financial Analyst') {
    return <FinancialAnalytics vehicles={vehicles || []} fuelData={fuelData || []} maintenanceData={maintenanceData || []} />;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{pageConfig.title}</h1>
        <p className="text-slate-400">{pageConfig.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Trip Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Trips</p>
                  <p className="text-2xl font-bold text-white">{tripSummary.totalTrips}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{tripSummary.completionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Distance</p>
                  <p className="text-2xl font-bold text-white">{tripSummary.totalDistance} km</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">{tripSummary.completedTrips}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-slate-400">Active</p>
              <p className="text-2xl font-bold text-blue-400">{tripSummary.activeTrips}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-slate-400">Cancelled</p>
              <p className="text-2xl font-bold text-red-400">{tripSummary.cancelledTrips}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-slate-400">Draft</p>
              <p className="text-2xl font-bold text-slate-400">
                {allTrips.filter((t: any) => t.status === 'Draft').length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Vehicle ROI Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Acquisition</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Fuel Cost</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Maintenance</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Total Operational</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ROI %</th>
              </tr>
            </thead>
            <tbody>
              {roiData.map((vehicle) => (
                <tr key={vehicle.vehicleId} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="py-3 px-4 text-white font-semibold">{vehicle.name}</td>
                  <td className="py-3 px-4 text-slate-400">${vehicle.acquisitionCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">${vehicle.fuelCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">${vehicle.maintenanceCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-white font-semibold">${vehicle.totalOperationalCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-green-400">
                      {vehicle.roiPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Fleet-wide Cost Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Acquisition Cost</p>
                  <p className="text-2xl font-bold text-white">
                    ${roiData.reduce((sum, v) => sum + v.acquisitionCost, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Operational Cost</p>
                  <p className="text-2xl font-bold text-white">
                    ${roiData.reduce((sum, v) => sum + v.totalOperationalCost, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-white">{roiData.length}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SafetyAnalytics({ drivers, trips }: { drivers: any[]; trips: any[] }) {
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d: any) => d.status === 'Active');
  const suspendedDrivers = drivers.filter((d: any) => d.status === 'Suspended');
  const validLicenses = drivers.filter((d: any) => {
    if (!d.licenseExpiry) return true;
    return new Date(d.licenseExpiry) > new Date();
  }).length;
  const expiredLicenses = totalDrivers - validLicenses;
  const expiringLicenses = drivers.filter((d: any) => {
    if (!d.licenseExpiry) return false;
    const exp = new Date(d.licenseExpiry);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return exp > now && exp <= thirtyDays;
  }).length;
  const averageSafetyScore = totalDrivers > 0 ? (drivers.reduce((s: number, d: any) => s + (d.safetyScore || 80), 0) / totalDrivers).toFixed(1) : '0';
  const completedTrips = trips.filter((t: any) => t.status === 'Completed').length;
  const avgCompletionRate = trips.length > 0 ? ((completedTrips / trips.length) * 100).toFixed(0) : '0';

  const highRiskDrivers = drivers.filter((d: any) => (d.safetyScore || 80) < 70);
  const topPerformers = [...drivers].sort((a, b) => (b.safetyScore || 80) - (a.safetyScore || 80)).slice(0, 3);
  const atRiskDrivers = drivers.filter((d: any) => (d.safetyScore || 80) < 75 || d.status === 'Suspended');

  const safetyScoreDistribution = [
    { range: '90-100', count: drivers.filter((d: any) => (d.safetyScore || 80) >= 90).length, color: 'bg-green-500' },
    { range: '80-89', count: drivers.filter((d: any) => (d.safetyScore || 80) >= 80 && (d.safetyScore || 80) < 90).length, color: 'bg-blue-500' },
    { range: '70-79', count: drivers.filter((d: any) => (d.safetyScore || 80) >= 70 && (d.safetyScore || 80) < 80).length, color: 'bg-yellow-500' },
    { range: 'Below 70', count: drivers.filter((d: any) => (d.safetyScore || 80) < 70).length, color: 'bg-red-500' },
  ];

  const maxDistCount = Math.max(...safetyScoreDistribution.map(d => d.count), 1);

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Safety & Compliance Analytics</h1>
        <p className="text-slate-400">Driver safety metrics, compliance trends, incident analysis, and risk monitoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Total Drivers</p>
            <p className="text-2xl font-bold text-white">{totalDrivers}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Compliance Rate</p>
            <p className="text-2xl font-bold text-green-400">{totalDrivers > 0 ? ((validLicenses / totalDrivers) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Avg Safety</p>
            <p className="text-2xl font-bold text-white">{averageSafetyScore}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Completion Rate</p>
            <p className="text-2xl font-bold text-white">{avgCompletionRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">High Risk</p>
            <p className="text-2xl font-bold text-red-400">{highRiskDrivers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Suspended</p>
            <p className="text-2xl font-bold text-red-400">{suspendedDrivers.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">License Status Overview</CardTitle>
            <CardDescription>Expired licenses block trip assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
              <span className="text-slate-300">Valid Licenses</span>
              <span className="font-bold text-green-400">{validLicenses}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
              <span className="text-slate-300">Expiring Soon (30 days)</span>
              <span className="font-bold text-yellow-400">{expiringLicenses}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
              <span className="text-slate-300">{'Expired -- Blocked'}</span>
              <span className="font-bold text-red-400">{expiredLicenses}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Suspended Drivers</span>
              <span className="font-bold text-orange-400">{suspendedDrivers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Safety Score Distribution</CardTitle>
            <CardDescription>How drivers are distributed across score ranges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {safetyScoreDistribution.map((band) => (
              <div key={band.range} className="flex items-center gap-3">
                <span className="text-sm text-slate-400 w-20">{band.range}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-4">
                  <div
                    className={`${band.color} h-4 rounded-full transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max((band.count / maxDistCount) * 100, 10)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{band.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top Performers</CardTitle>
            <CardDescription>Highest safety scores and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPerformers.map((driver: any, i: number) => (
                <div key={driver._id || driver.name} className="flex items-center gap-3 p-3 bg-green-900/10 border border-green-800/20 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-green-900/40 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-green-300">#{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{driver.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{driver.safetyScore || 80}</p>
                    <p className="text-[10px] text-slate-500">Safety Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">At-Risk Drivers</CardTitle>
            <CardDescription>Drivers requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {atRiskDrivers.map((driver: any) => (
                <div key={driver._id || driver.name} className="flex items-center gap-3 p-3 bg-red-900/10 border border-red-800/20 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{driver.name}</p>
                    <p className="text-xs text-red-400/80">
                      {driver.status === 'Suspended' ? 'Suspended' : 'Low safety score'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{driver.safetyScore || 80}</p>
                    <p className="text-[10px] text-slate-500">Safety Score</p>
                  </div>
                </div>
              ))}
              {atRiskDrivers.length === 0 && (
                <p className="text-center py-4 text-sm text-slate-500">No at-risk drivers detected.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialAnalytics({ vehicles, fuelData, maintenanceData }: { vehicles: any[]; fuelData: any[]; maintenanceData: any[] }) {
  const totalFuelCost = fuelData.reduce((s: number, f: any) => s + f.totalCost, 0);
  const totalMaintCost = maintenanceData.reduce((s: number, m: any) => s + m.cost, 0);
  const totalCosts = totalFuelCost + totalMaintCost;
  // Estimate revenue as 2.5x costs for demonstration
  const totalRevenue = Math.round(totalCosts * 2.5);
  const totalProfit = totalRevenue - totalCosts;
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const vehicleProfitability = vehicles.map((v: any) => {
    const vFuel = fuelData.filter((f: any) => f.vehicleId === v.registrationNumber).reduce((s: number, f: any) => s + f.totalCost, 0);
    const vMaint = maintenanceData.filter((m: any) => m.vehicleId === v.registrationNumber).reduce((s: number, m: any) => s + m.cost, 0);
    const vCost = vFuel + vMaint;
    const vRev = Math.round(vCost * 2.5);
    const vProfit = vRev - vCost;
    return {
      vehicle: v.registrationNumber,
      revenue: vRev,
      totalCost: vCost,
      profit: vProfit,
      margin: vRev > 0 ? ((vProfit / vRev) * 100).toFixed(1) : '0',
      efficiency: (fuelData.filter((f: any) => f.vehicleId === v.registrationNumber).reduce((s: number, f: any) => s + (f.kmDriven || 0), 0) / Math.max(fuelData.filter((f: any) => f.vehicleId === v.registrationNumber).reduce((s: number, f: any) => s + f.fuelQuantity, 0), 1)).toFixed(1),
      roi: vCost > 0 ? (vRev / vCost).toFixed(2) : '0',
    };
  });

  const costCategories = [
    { name: 'Fuel', value: totalFuelCost, fill: '#10b981' },
    { name: 'Maintenance', value: totalMaintCost, fill: '#f97316' },
  ];

  const totalCostBreakdown = costCategories.reduce((s, c) => s + c.value, 0);

  const profitChartData = vehicleProfitability.map((v: any) => ({
    vehicle: v.vehicle,
    Revenue: v.revenue,
    Cost: v.totalCost,
    Profit: v.profit,
  }));

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Financial Analytics & Reports</h1>
        <p className="text-slate-400">Deep-dive cost analysis, profitability metrics, and vehicle ROI</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Total Revenue</p>
            <p className="text-xl font-bold text-green-400">${(totalRevenue / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Total Costs</p>
            <p className="text-xl font-bold text-orange-400">${(totalCosts / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Net Profit</p>
            <p className="text-xl font-bold text-blue-400">${(totalProfit / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Profit Margin</p>
            <p className="text-xl font-bold text-green-400">{overallMargin}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4">
            <p className="text-xs text-slate-400">Fleet Vehicles</p>
            <p className="text-xl font-bold text-white">{vehicles.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Vehicle Profitability Comparison</CardTitle>
            <CardDescription>Revenue, cost, and profit per vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={profitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="vehicle" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cost" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Cost Breakdown</CardTitle>
            <CardDescription>All operational cost categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={costCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  label={({ name }) => `${name}`}
                >
                  {costCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {costCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.fill }} />
                    <span className="text-slate-300">{cat.name}</span>
                  </div>
                  <span className="text-white font-medium">${cat.value.toLocaleString()} ({totalCostBreakdown > 0 ? ((cat.value / totalCostBreakdown) * 100).toFixed(0) : 0}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Vehicle Financial Summary</CardTitle>
          <CardDescription>Revenue, costs, profit margin, efficiency, and ROI for each vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Total Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Profit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Margin</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Efficiency</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ROI</th>
                </tr>
              </thead>
              <tbody>
                {vehicleProfitability.map((v: any) => (
                  <tr key={v.vehicle} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white font-semibold">{v.vehicle}</td>
                    <td className="py-3 px-4 text-right text-green-400">${v.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-orange-400">${v.totalCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-blue-400 font-semibold">${v.profit.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-400 font-medium">{v.margin}%</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">{v.efficiency} km/L</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-blue-400">{v.roi}x</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
