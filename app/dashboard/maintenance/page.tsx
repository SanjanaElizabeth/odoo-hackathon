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
import { Plus, Wrench, Eye, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MaintenanceRecord {
  _id: string;
  vehicleId: { _id: string; name: string } | null;
  serviceType: string;
  cost: number;
  serviceDate: string;
  status: string;
}

interface Vehicle {
  _id: string;
  name: string;
}

const rolePageConfig: Record<string, { title: string; description: string }> = {
  Manager: { title: 'Maintenance & Service Logs', description: 'Record service logs, schedule repairs, and track vehicle health' },
  'Financial Analyst': { title: 'Maintenance Cost Analysis', description: 'Analyze maintenance expenses, cost trends, and per-vehicle spending' },
};

export default function MaintenancePage() {
  const [userRole, setUserRole] = useState('Manager');
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newRecord, setNewRecord] = useState({ vehicleId: '', serviceType: '', cost: '', serviceDate: '' });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUserRole(role);
    setMounted(true);
  }, []);

  const { data: records = [], isLoading } = useSWR<MaintenanceRecord[]>('/api/maintenance', fetcher);
  const { data: vehicles = [] } = useSWR<Vehicle[]>('/api/vehicles', fetcher);

  const filteredRecords = filterStatus ? records.filter(r => r.status === filterStatus) : records;

  const handleAdd = async () => {
    setFormError('');
    if (!newRecord.vehicleId || !newRecord.serviceType.trim() || !newRecord.cost || !newRecord.serviceDate) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: newRecord.vehicleId,
          serviceType: newRecord.serviceType.trim(),
          cost: parseFloat(newRecord.cost),
          serviceDate: newRecord.serviceDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Failed to log service');
        return;
      }
      mutate('/api/maintenance');
      setDialogOpen(false);
      setNewRecord({ vehicleId: '', serviceType: '', cost: '', serviceDate: '' });
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { scheduled: 'bg-blue-900 text-blue-200', completed: 'bg-green-900 text-green-200', cancelled: 'bg-red-900 text-red-200' };
    return colors[status] || 'bg-slate-700 text-slate-200';
  };

  const totalCost = filteredRecords.reduce((sum, r) => sum + r.cost, 0);
  const avgCostPerRecord = filteredRecords.length > 0 ? Math.round(totalCost / filteredRecords.length) : 0;
  const isFinancialAnalyst = userRole === 'Financial Analyst';

  const vehicleCostData = Object.values(
    records.reduce<Record<string, { vehicle: string; cost: number; count: number }>>((acc, r) => {
      const vName = r.vehicleId?.name || 'Unknown';
      if (!acc[vName]) acc[vName] = { vehicle: vName, cost: 0, count: 0 };
      acc[vName].cost += r.cost;
      acc[vName].count += 1;
      return acc;
    }, {})
  );

  const serviceTypeCosts = Object.values(
    records.reduce<Record<string, { serviceType: string; cost: number; count: number }>>((acc, r) => {
      if (!acc[r.serviceType]) acc[r.serviceType] = { serviceType: r.serviceType, cost: 0, count: 0 };
      acc[r.serviceType].cost += r.cost;
      acc[r.serviceType].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.cost - a.cost);

  const canManageMaintenance = userRole === 'Manager';
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
        {canManageMaintenance && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="mr-2 h-4 w-4" />Log Service</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Log Maintenance Service</DialogTitle>
                <DialogDescription className="text-slate-400">Record a maintenance service for a vehicle.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-slate-300">Vehicle</Label>
                  <Select value={newRecord.vehicleId} onValueChange={v => setNewRecord(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-slate-300">Service Type</Label><Input placeholder="e.g. Oil Change" value={newRecord.serviceType} onChange={e => setNewRecord(p => ({ ...p, serviceType: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-slate-300">Cost</Label><Input type="number" placeholder="e.g. 250" value={newRecord.cost} onChange={e => setNewRecord(p => ({ ...p, cost: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">Service Date</Label><Input type="date" value={newRecord.serviceDate} onChange={e => setNewRecord(p => ({ ...p, serviceDate: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" /></div>
                </div>
                {formError && <div className="px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg"><p className="text-sm text-red-300">{formError}</p></div>}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
                <Button onClick={handleAdd} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Log Service
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManageMaintenance && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
          <Eye className="h-4 w-4 text-blue-400" />
          <p className="text-sm text-slate-400">You have <span className="text-blue-400 font-medium">read-only</span> access to maintenance records for cost analysis.</p>
        </div>
      )}

      {/* KPIs */}
      <div className={`grid grid-cols-1 gap-4 ${isFinancialAnalyst ? 'sm:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-3'}`}>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Records</p><p className="text-2xl font-bold text-white">{filteredRecords.length}</p></div><Wrench className="h-8 w-8 text-blue-400" /></div></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Cost</p><p className="text-2xl font-bold text-white">${totalCost.toLocaleString()}</p></div><DollarSign className="h-8 w-8 text-orange-400" /></div></CardContent></Card>
        <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Scheduled</p><p className="text-2xl font-bold text-white">{filteredRecords.filter(r => r.status === 'scheduled').length}</p></div><Wrench className="h-8 w-8 text-yellow-400" /></div></CardContent></Card>
        {isFinancialAnalyst && (
          <>
            <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Avg Cost/Service</p><p className="text-2xl font-bold text-blue-400">${avgCostPerRecord.toLocaleString()}</p></div><TrendingUp className="h-8 w-8 text-blue-400" /></div></CardContent></Card>
            <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Vehicles Serviced</p><p className="text-2xl font-bold text-green-400">{vehicleCostData.length}</p></div><Wrench className="h-8 w-8 text-green-400" /></div></CardContent></Card>
          </>
        )}
      </div>

      {/* Financial Analyst Charts */}
      {isFinancialAnalyst && vehicleCostData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white">Cost by Vehicle</CardTitle><CardDescription>Total maintenance spend per vehicle</CardDescription></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={vehicleCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="vehicle" stroke="#94a3b8" /><YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }} />
                  <Bar dataKey="cost" name="Cost ($)" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white">Cost by Service Type</CardTitle><CardDescription>Which service types cost the most</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceTypeCosts.map(st => {
                  const totalAllCosts = records.reduce((s, r) => s + r.cost, 0);
                  const pct = totalAllCosts > 0 ? ((st.cost / totalAllCosts) * 100).toFixed(0) : '0';
                  return (
                    <div key={st.serviceType}>
                      <div className="flex justify-between items-center mb-1"><span className="text-sm text-slate-300">{st.serviceType}</span><span className="text-sm font-medium text-white">${st.cost.toLocaleString()} ({pct}%)</span></div>
                      <div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="w-full md:w-64">
            <label className="text-sm text-slate-300 block mb-2">Status</label>
            <Select value={filterStatus || 'all'} onValueChange={val => setFilterStatus(val === 'all' ? '' : val)}>
              <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => (
            <Card key={record._id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div><p className="text-xs text-slate-400">Service Type</p><p className="text-sm font-semibold text-white">{record.serviceType}</p></div>
                  <div><p className="text-xs text-slate-400">Vehicle</p><p className="text-sm text-slate-200">{record.vehicleId?.name || 'Unknown'}</p></div>
                  <div><p className="text-xs text-slate-400">Service Date</p><p className="text-sm text-slate-200">{new Date(record.serviceDate).toLocaleDateString()}</p></div>
                  <div><p className="text-xs text-slate-400">Cost</p><p className="text-sm font-semibold text-white">${record.cost.toLocaleString()}</p></div>
                  <div className="flex justify-between items-center md:justify-end gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>{record.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredRecords.length === 0 && <div className="text-center py-12 text-slate-500">No maintenance records found.</div>}
        </div>
      )}
    </div>
  );
}
