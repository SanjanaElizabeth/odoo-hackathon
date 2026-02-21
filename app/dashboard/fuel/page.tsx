'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Fuel, Eye, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface FuelExpense {
  _id: string;
  vehicleId: { _id: string; name: string } | null;
  liters: number;
  cost: number;
  costPerLiter: number;
  km: number;
  fuelDate: string;
}

interface Vehicle {
  _id: string;
  name: string;
}

const rolePageConfig: Record<string, { title: string; description: string }> = {
  Manager: { title: 'Fuel & Expense Logging', description: 'Track and manage fuel consumption and operational costs' },
  'Financial Analyst': { title: 'Fuel Cost Analysis', description: 'Analyze fuel expenses, consumption patterns, and efficiency metrics' },
};

export default function FuelPage() {
  const [userRole, setUserRole] = useState('Manager');
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newExpense, setNewExpense] = useState({ vehicleId: '', liters: '', cost: '', km: '', fuelDate: '' });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUserRole(role);
    setMounted(true);
  }, []);

  const { data: expenses = [], isLoading } = useSWR<FuelExpense[]>('/api/fuel', fetcher);
  const { data: vehicles = [] } = useSWR<Vehicle[]>('/api/vehicles', fetcher);

  const handleAdd = async () => {
    setFormError('');
    if (!newExpense.vehicleId || !newExpense.liters || !newExpense.cost || !newExpense.fuelDate) {
      setFormError('Vehicle, liters, cost, and date are required.');
      return;
    }
    const liters = parseFloat(newExpense.liters);
    const cost = parseFloat(newExpense.cost);
    if (isNaN(liters) || isNaN(cost)) { setFormError('Liters and cost must be numbers.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: newExpense.vehicleId,
          liters,
          cost,
          costPerLiter: parseFloat((cost / liters).toFixed(2)),
          km: parseFloat(newExpense.km) || 0,
          fuelDate: newExpense.fuelDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Failed to log fuel');
        return;
      }
      mutate('/api/fuel');
      setDialogOpen(false);
      setNewExpense({ vehicleId: '', liters: '', cost: '', km: '', fuelDate: '' });
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = expenses.reduce((sum, e) => sum + e.cost, 0);
  const totalLiters = expenses.reduce((sum, e) => sum + e.liters, 0);
  const totalKm = expenses.reduce((sum, e) => sum + e.km, 0);
  const avgCostPerLiter = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '0.00';
  const avgEfficiency = totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : '0.0';
  const costPerKm = totalKm > 0 ? (totalCost / totalKm).toFixed(2) : '0.00';

  const vehicleFuelData = Object.values(
    expenses.reduce<Record<string, { vehicle: string; liters: number; cost: number; km: number }>>((acc, e) => {
      const vName = e.vehicleId?.name || 'Unknown';
      if (!acc[vName]) acc[vName] = { vehicle: vName, liters: 0, cost: 0, km: 0 };
      acc[vName].liters += e.liters;
      acc[vName].cost += e.cost;
      acc[vName].km += e.km;
      return acc;
    }, {})
  ).map(v => ({
    ...v,
    efficiency: parseFloat((v.km / v.liters).toFixed(1)),
    costPerKm: parseFloat((v.cost / v.km).toFixed(1)),
  }));

  const canLogFuel = userRole === 'Manager';
  const isFinancialAnalyst = userRole === 'Financial Analyst';
  const pageConfig = rolePageConfig[userRole] || rolePageConfig['Manager'];

  if (!mounted) {
    return <div className="p-6"><div className="text-center text-slate-400">Loading...</div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{pageConfig.title}</h1>
          <p className="text-slate-400">{pageConfig.description}</p>
        </div>
        {canLogFuel && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="mr-2 h-4 w-4" />Log Fuel</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Log Fuel Expense</DialogTitle>
                <DialogDescription className="text-slate-400">Record a fuel purchase for a vehicle.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Vehicle</Label>
                  <Select value={newExpense.vehicleId} onValueChange={v => setNewExpense(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-slate-300">Liters</Label><Input type="number" placeholder="e.g. 150" value={newExpense.liters} onChange={e => setNewExpense(p => ({ ...p, liters: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">Cost</Label><Input type="number" placeholder="e.g. 15000" value={newExpense.cost} onChange={e => setNewExpense(p => ({ ...p, cost: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-slate-300">Km Driven</Label><Input type="number" placeholder="e.g. 930" value={newExpense.km} onChange={e => setNewExpense(p => ({ ...p, km: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">Date</Label><Input type="date" value={newExpense.fuelDate} onChange={e => setNewExpense(p => ({ ...p, fuelDate: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" /></div>
                </div>
                {formError && <div className="px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg"><p className="text-sm text-red-300">{formError}</p></div>}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
                <Button onClick={handleAdd} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Log Fuel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canLogFuel && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
          <Eye className="h-4 w-4 text-blue-400" />
          <p className="text-sm text-slate-400">You have <span className="text-blue-400 font-medium">read-only</span> access to fuel records for financial analysis.</p>
        </div>
      )}

      {/* KPIs */}
      <div className={`grid grid-cols-1 gap-4 ${isFinancialAnalyst ? 'md:grid-cols-3 lg:grid-cols-6' : 'md:grid-cols-4'}`}>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Cost</p><p className="text-2xl font-bold text-white">${totalCost.toLocaleString()}</p></div><DollarSign className="h-6 w-6 text-orange-400" /></div></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Liters</p><p className="text-2xl font-bold text-white">{totalLiters.toLocaleString()} L</p></div><Fuel className="h-6 w-6 text-green-400" /></div></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div><p className="text-sm text-slate-400">Avg Cost/Liter</p><p className="text-2xl font-bold text-white">${avgCostPerLiter}</p></div></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div><p className="text-sm text-slate-400">Total Records</p><p className="text-2xl font-bold text-white">{expenses.length}</p></div></CardContent></Card>
        {isFinancialAnalyst && (
          <>
            <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Fuel Efficiency</p><p className="text-2xl font-bold text-green-400">{avgEfficiency} km/L</p></div><TrendingUp className="h-6 w-6 text-green-400" /></div></CardContent></Card>
            <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Cost per Km</p><p className="text-2xl font-bold text-blue-400">${costPerKm}</p></div><TrendingDown className="h-6 w-6 text-blue-400" /></div></CardContent></Card>
          </>
        )}
      </div>

      {isFinancialAnalyst && vehicleFuelData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader><CardTitle className="text-white">Per-Vehicle Fuel Efficiency</CardTitle><CardDescription>Efficiency (km/L) and cost per km by vehicle</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vehicleFuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="vehicle" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
                <Legend />
                <Bar dataKey="efficiency" name="Efficiency (km/L)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costPerKm" name="Cost/Km ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Vehicle</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Liters</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Cost</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Cost/Liter</th>
                {isFinancialAnalyst && <><th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Km Driven</th><th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Efficiency (km/L)</th></>}
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => {
                const efficiency = expense.liters > 0 ? (expense.km / expense.liters).toFixed(1) : '--';
                return (
                  <tr key={expense._id} className="border-b border-slate-700 hover:bg-slate-800">
                    <td className="py-3 px-4 text-white font-medium">{expense.vehicleId?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{expense.liters} L</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">${expense.cost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-400">${expense.costPerLiter}</td>
                    {isFinancialAnalyst && <><td className="py-3 px-4 text-right text-slate-300">{expense.km}</td><td className="py-3 px-4 text-right text-green-400">{efficiency}</td></>}
                    <td className="py-3 px-4 text-slate-400">{new Date(expense.fuelDate).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
            {isFinancialAnalyst && expenses.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-600">
                  <td className="py-3 px-4 text-white font-bold">Totals</td>
                  <td className="py-3 px-4 text-right text-white font-bold">{totalLiters} L</td>
                  <td className="py-3 px-4 text-right text-orange-400 font-bold">${totalCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-white">${avgCostPerLiter}</td>
                  <td className="py-3 px-4 text-right text-white font-bold">{totalKm}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-bold">{avgEfficiency} km/L</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
