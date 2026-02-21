'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, Calendar, Filter, TrendingUp, DollarSign, Fuel, Wrench } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface FuelRecord {
  vehicle: string;
  date: string;
  liters: number;
  cost: number;
  km: number;
  efficiency: string;
}

interface MaintenanceRecord {
  vehicle: string;
  date: string;
  serviceType: string;
  cost: number;
  status: string;
}

interface PayrollSummary {
  driver: string;
  role: string;
  tripsCompleted: number;
  basePay: number;
  bonus: number;
  totalPay: number;
}

interface VehicleCostSummary {
  vehicle: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
  revenue: number;
  profit: number;
  roi: string;
}

type ReportType = 'fuel' | 'maintenance' | 'vehicle-cost' | 'payroll';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>('fuel');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const { data: fuelRaw } = useSWR('/api/fuel', fetcher);
  const { data: maintRaw } = useSWR('/api/maintenance', fetcher);
  const { data: vehiclesRaw } = useSWR('/api/vehicles', fetcher);
  const { data: driversRaw } = useSWR('/api/drivers', fetcher);
  const { data: tripsRaw } = useSWR('/api/trips', fetcher);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform API data to report formats
  const fuelRecords: FuelRecord[] = (fuelRaw || []).map((f: any) => ({
    vehicle: f.vehicleId,
    date: f.date ? new Date(f.date).toISOString().split('T')[0] : '',
    liters: f.fuelQuantity || 0,
    cost: f.totalCost || 0,
    km: f.kmDriven || 0,
    efficiency: f.fuelQuantity > 0 ? ((f.kmDriven || 0) / f.fuelQuantity).toFixed(1) : '0',
  }));

  const maintenanceRecords: MaintenanceRecord[] = (maintRaw || []).map((m: any) => ({
    vehicle: m.vehicleId,
    date: m.date ? new Date(m.date).toISOString().split('T')[0] : '',
    serviceType: m.serviceType || 'General',
    cost: m.cost || 0,
    status: m.status || 'Completed',
  }));

  const vehicleCostData: VehicleCostSummary[] = (vehiclesRaw || []).map((v: any) => {
    const vFuel = (fuelRaw || []).filter((f: any) => f.vehicleId === v.registrationNumber).reduce((s: number, f: any) => s + (f.totalCost || 0), 0);
    const vMaint = (maintRaw || []).filter((m: any) => m.vehicleId === v.registrationNumber).reduce((s: number, m: any) => s + (m.cost || 0), 0);
    const totalCost = vFuel + vMaint;
    const revenue = Math.round(totalCost * 2.5);
    const profit = revenue - totalCost;
    return {
      vehicle: v.registrationNumber,
      fuelCost: vFuel,
      maintenanceCost: vMaint,
      totalCost,
      revenue,
      profit,
      roi: totalCost > 0 ? ((profit / totalCost) * 100).toFixed(0) : '0',
    };
  });

  const payrollData: PayrollSummary[] = (driversRaw || []).map((d: any) => {
    const driverTrips = (tripsRaw || []).filter((t: any) => t.driverName === d.name && t.status === 'Completed').length;
    const basePay = d.status === 'Active' ? 38000 : 0;
    const bonus = driverTrips * 100;
    return {
      driver: d.name,
      role: d.experience && d.experience > 5 ? 'Senior Driver' : 'Driver',
      tripsCompleted: driverTrips,
      basePay,
      bonus,
      totalPay: basePay + bonus,
    };
  });

  const vehicles = (vehiclesRaw || []).map((v: any) => v.registrationNumber);

  // --- CSV Export ---
  const exportCSV = useCallback(() => {
    let csvContent = '';
    let filename = '';

    switch (selectedReport) {
      case 'fuel': {
        const filtered = vehicleFilter === 'all' ? fuelRecords : fuelRecords.filter(r => r.vehicle === vehicleFilter);
        csvContent = 'Vehicle,Date,Liters,Cost,Km Driven,Efficiency (km/L)\n';
        filtered.forEach(r => {
          csvContent += `${r.vehicle},${r.date},${r.liters},${r.cost},${r.km},${r.efficiency}\n`;
        });
        const totalLiters = filtered.reduce((s, r) => s + r.liters, 0);
        const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
        const totalKm = filtered.reduce((s, r) => s + r.km, 0);
        csvContent += `\nTotals,,${totalLiters},${totalCost},${totalKm},${totalKm > 0 && totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : ''}\n`;
        filename = 'fuel-expense-report.csv';
        break;
      }
      case 'maintenance': {
        const filtered = vehicleFilter === 'all' ? maintenanceRecords : maintenanceRecords.filter(r => r.vehicle === vehicleFilter);
        csvContent = 'Vehicle,Date,Service Type,Cost,Status\n';
        filtered.forEach(r => {
          csvContent += `${r.vehicle},${r.date},${r.serviceType},${r.cost},${r.status}\n`;
        });
        csvContent += `\nTotal Cost,,,${filtered.reduce((s, r) => s + r.cost, 0)},\n`;
        filename = 'maintenance-cost-report.csv';
        break;
      }
      case 'vehicle-cost': {
        csvContent = 'Vehicle,Fuel Cost,Maintenance Cost,Total Cost,Revenue,Profit,ROI %\n';
        vehicleCostData.forEach(r => {
          csvContent += `${r.vehicle},${r.fuelCost},${r.maintenanceCost},${r.totalCost},${r.revenue},${r.profit},${r.roi}\n`;
        });
        filename = 'vehicle-cost-summary.csv';
        break;
      }
      case 'payroll': {
        csvContent = 'Driver,Role,Trips Completed,Base Pay,Bonus,Total Pay\n';
        payrollData.forEach(r => {
          csvContent += `${r.driver},${r.role},${r.tripsCompleted},${r.basePay},${r.bonus},${r.totalPay}\n`;
        });
        filename = 'payroll-summary.csv';
        break;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [selectedReport, vehicleFilter, fuelRecords, maintenanceRecords, vehicleCostData, payrollData]);

  // --- PDF Export ---
  const exportPDF = useCallback(() => {
    let title = '';
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let summaryLines: string[] = [];

    switch (selectedReport) {
      case 'fuel': {
        title = 'Fuel Expense Report';
        const filtered = vehicleFilter === 'all' ? fuelRecords : fuelRecords.filter(r => r.vehicle === vehicleFilter);
        tableHeaders = ['Vehicle', 'Date', 'Liters', 'Cost', 'Km', 'km/L'];
        tableRows = filtered.map(r => [r.vehicle, r.date, String(r.liters), `$${r.cost.toLocaleString()}`, String(r.km), r.efficiency]);
        const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
        const totalLiters = filtered.reduce((s, r) => s + r.liters, 0);
        summaryLines = [`Total Cost: $${totalCost.toLocaleString()}`, `Total Liters: ${totalLiters}`];
        break;
      }
      case 'maintenance': {
        title = 'Maintenance Cost Report';
        const filtered = vehicleFilter === 'all' ? maintenanceRecords : maintenanceRecords.filter(r => r.vehicle === vehicleFilter);
        tableHeaders = ['Vehicle', 'Date', 'Service Type', 'Cost', 'Status'];
        tableRows = filtered.map(r => [r.vehicle, r.date, r.serviceType, `$${r.cost.toLocaleString()}`, r.status]);
        summaryLines = [`Total Maintenance Cost: $${filtered.reduce((s, r) => s + r.cost, 0).toLocaleString()}`];
        break;
      }
      case 'vehicle-cost': {
        title = 'Vehicle Cost Summary Report';
        tableHeaders = ['Vehicle', 'Fuel', 'Maintenance', 'Total Cost', 'Revenue', 'Profit', 'ROI'];
        tableRows = vehicleCostData.map(r => [r.vehicle, `$${r.fuelCost.toLocaleString()}`, `$${r.maintenanceCost.toLocaleString()}`, `$${r.totalCost.toLocaleString()}`, `$${r.revenue.toLocaleString()}`, `$${r.profit.toLocaleString()}`, `${r.roi}%`]);
        break;
      }
      case 'payroll': {
        title = 'Payroll Summary Report';
        tableHeaders = ['Driver', 'Role', 'Trips', 'Base Pay', 'Bonus', 'Total Pay'];
        tableRows = payrollData.map(r => [r.driver, r.role, String(r.tripsCompleted), `$${r.basePay.toLocaleString()}`, `$${r.bonus.toLocaleString()}`, `$${r.totalPay.toLocaleString()}`]);
        summaryLines = [`Total Payroll: $${payrollData.reduce((s, r) => s + r.totalPay, 0).toLocaleString()}`];
        break;
      }
    }

    const colWidths = tableHeaders.map(() => `${(100 / tableHeaders.length).toFixed(1)}%`);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - FleetFlow</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1e293b; color: #fff; padding: 10px 8px; text-align: left; font-size: 12px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; font-size: 12px; }
          tr:nth-child(even) { background: #f8fafc; }
          .summary { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 12px; }
          .summary p { margin: 4px 0; font-size: 13px; }
          .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | FleetFlow Financial Reports</p>
        <table>
          <thead><tr>${tableHeaders.map((h, i) => `<th style="width:${colWidths[i]}">${h}</th>`).join('')}</tr></thead>
          <tbody>${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        ${summaryLines.length > 0 ? `<div class="summary"><strong>Summary</strong>${summaryLines.map(l => `<p>${l}</p>`).join('')}</div>` : ''}
        <div class="footer">
          <p>FleetFlow Report System | Confidential</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [selectedReport, vehicleFilter, fuelRecords, maintenanceRecords, vehicleCostData, payrollData]);

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-400">Loading...</div>
      </div>
    );
  }

  const reportTypes = [
    { value: 'fuel' as ReportType, label: 'Fuel Expense Report', icon: Fuel, description: 'Fuel usage, costs, and efficiency per vehicle' },
    { value: 'maintenance' as ReportType, label: 'Maintenance Cost Report', icon: Wrench, description: 'Service records and maintenance costs' },
    { value: 'vehicle-cost' as ReportType, label: 'Vehicle Cost Summary', icon: DollarSign, description: 'Total cost, revenue, profit, and ROI per vehicle' },
    { value: 'payroll' as ReportType, label: 'Payroll Summary', icon: TrendingUp, description: 'Driver pay, bonuses, and trip completion' },
  ];

  const activeReport = reportTypes.find(r => r.value === selectedReport)!;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Financial Reports</h1>
        <p className="text-slate-400">Generate and export CSV / PDF reports for audits and payroll</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((rt) => {
          const Icon = rt.icon;
          const isActive = selectedReport === rt.value;
          return (
            <button
              key={rt.value}
              onClick={() => setSelectedReport(rt.value)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{rt.label}</span>
              </div>
              <p className="text-xs text-slate-500">{rt.description}</p>
            </button>
          );
        })}
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {(selectedReport === 'fuel' || selectedReport === 'maintenance') && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-200">
                      <SelectValue placeholder="All vehicles" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="all">All Vehicles</SelectItem>
                      {vehicles.map((v: string) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>All Time</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={exportCSV}
                variant="outline"
                className="border-green-600/50 text-green-400 hover:bg-green-600/10 hover:text-green-300"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={exportPDF}
                variant="outline"
                className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <activeReport.icon className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white">{activeReport.label}</CardTitle>
          </div>
          <CardDescription>{activeReport.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedReport === 'fuel' && <FuelReportTable records={fuelRecords} vehicleFilter={vehicleFilter} />}
          {selectedReport === 'maintenance' && <MaintenanceReportTable records={maintenanceRecords} vehicleFilter={vehicleFilter} />}
          {selectedReport === 'vehicle-cost' && <VehicleCostTable data={vehicleCostData} />}
          {selectedReport === 'payroll' && <PayrollTable data={payrollData} />}
        </CardContent>
      </Card>
    </div>
  );
}

function FuelReportTable({ records, vehicleFilter }: { records: FuelRecord[]; vehicleFilter: string }) {
  const filtered = vehicleFilter === 'all' ? records : records.filter(r => r.vehicle === vehicleFilter);
  const totalLiters = filtered.reduce((s, r) => s + r.liters, 0);
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0);
  const totalKm = filtered.reduce((s, r) => s + r.km, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Liters</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Cost</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Km Driven</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Efficiency (km/L)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={`${r.vehicle}-${r.date}-${i}`} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="py-3 px-4 text-white font-medium">{r.vehicle}</td>
              <td className="py-3 px-4 text-slate-400">{r.date}</td>
              <td className="py-3 px-4 text-right text-slate-300">{r.liters}</td>
              <td className="py-3 px-4 text-right text-orange-400">${r.cost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-slate-300">{r.km}</td>
              <td className="py-3 px-4 text-right text-green-400">{r.efficiency}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="py-8 text-center text-slate-500">No fuel records found</td></tr>
          )}
        </tbody>
        {filtered.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-600">
              <td className="py-3 px-4 text-white font-bold" colSpan={2}>Totals</td>
              <td className="py-3 px-4 text-right text-white font-bold">{totalLiters}</td>
              <td className="py-3 px-4 text-right text-orange-400 font-bold">${totalCost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-white font-bold">{totalKm}</td>
              <td className="py-3 px-4 text-right text-green-400 font-bold">{totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : '--'}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function MaintenanceReportTable({ records, vehicleFilter }: { records: MaintenanceRecord[]; vehicleFilter: string }) {
  const filtered = vehicleFilter === 'all' ? records : records.filter(r => r.vehicle === vehicleFilter);
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0);

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-900/40 text-green-300';
    if (status === 'Scheduled') return 'bg-blue-900/40 text-blue-300';
    if (status === 'In Progress') return 'bg-yellow-900/40 text-yellow-300';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Service Type</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Cost</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={`${r.vehicle}-${r.date}-${i}`} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="py-3 px-4 text-white font-medium">{r.vehicle}</td>
              <td className="py-3 px-4 text-slate-400">{r.date}</td>
              <td className="py-3 px-4 text-slate-300">{r.serviceType}</td>
              <td className="py-3 px-4 text-right text-orange-400">${r.cost.toLocaleString()}</td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={5} className="py-8 text-center text-slate-500">No maintenance records found</td></tr>
          )}
        </tbody>
        {filtered.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-600">
              <td className="py-3 px-4 text-white font-bold" colSpan={3}>Total Maintenance Cost</td>
              <td className="py-3 px-4 text-right text-orange-400 font-bold">${totalCost.toLocaleString()}</td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function VehicleCostTable({ data }: { data: VehicleCostSummary[] }) {
  const totals = data.reduce(
    (acc, r) => ({
      fuel: acc.fuel + r.fuelCost,
      maint: acc.maint + r.maintenanceCost,
      cost: acc.cost + r.totalCost,
      rev: acc.rev + r.revenue,
      profit: acc.profit + r.profit,
    }),
    { fuel: 0, maint: 0, cost: 0, rev: 0, profit: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Fuel Cost</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Maintenance</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Total Cost</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Revenue</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Profit</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">ROI %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.vehicle} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="py-3 px-4 text-white font-medium">{r.vehicle}</td>
              <td className="py-3 px-4 text-right text-slate-400">${r.fuelCost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-slate-400">${r.maintenanceCost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-orange-400 font-medium">${r.totalCost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-slate-300">${r.revenue.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-green-400 font-semibold">${r.profit.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-blue-400 font-semibold">{r.roi}%</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={7} className="py-8 text-center text-slate-500">No vehicle data found</td></tr>
          )}
        </tbody>
        {data.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-600">
              <td className="py-3 px-4 text-white font-bold">Totals</td>
              <td className="py-3 px-4 text-right text-white font-medium">${totals.fuel.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-white font-medium">${totals.maint.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-orange-400 font-bold">${totals.cost.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-white font-bold">${totals.rev.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-green-400 font-bold">${totals.profit.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-slate-500">--</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function PayrollTable({ data }: { data: PayrollSummary[] }) {
  const totalPayroll = data.reduce((s, r) => s + r.totalPay, 0);
  const totalBonus = data.reduce((s, r) => s + r.bonus, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Driver</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Role</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Trips</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Base Pay</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Bonus</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Total Pay</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.driver} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="py-3 px-4 text-white font-medium">{r.driver}</td>
              <td className="py-3 px-4 text-slate-400">{r.role}</td>
              <td className="py-3 px-4 text-right text-slate-300">{r.tripsCompleted}</td>
              <td className="py-3 px-4 text-right text-slate-400">${r.basePay.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-green-400">${r.bonus.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-white font-semibold">${r.totalPay.toLocaleString()}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={6} className="py-8 text-center text-slate-500">No driver data found</td></tr>
          )}
        </tbody>
        {data.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-slate-600">
              <td className="py-3 px-4 text-white font-bold" colSpan={4}>Total Payroll</td>
              <td className="py-3 px-4 text-right text-green-400 font-bold">${totalBonus.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-white font-bold">${totalPayroll.toLocaleString()}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
