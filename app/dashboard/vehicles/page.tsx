'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Eye, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Vehicle {
  _id: string;
  name: string;
  licensePlate: string;
  model: string;
  type: 'truck' | 'van' | 'bike';
  maxLoadCapacity: number;
  status: string;
  currentOdometer: number;
  region?: string;
}

const rolePageConfig: Record<string, { title: string; description: string }> = {
  Manager: { title: 'Vehicle Registry', description: 'Add, update, or remove vehicles from your fleet' },
  Dispatcher: { title: 'Vehicle Availability', description: 'View vehicle status for trip assignments' },
  'Safety Officer': { title: 'Vehicle Inspection Overview', description: 'Review vehicle conditions and maintenance status' },
};

export default function VehiclesPage() {
  const [userRole, setUserRole] = useState('Manager');
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    name: '', licensePlate: '', model: '', type: 'truck', maxLoadCapacity: '', currentOdometer: '', region: '',
  });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUserRole(role);
    setMounted(true);
  }, []);

  const params = new URLSearchParams();
  if (filterType) params.set('type', filterType);
  if (filterStatus) params.set('status', filterStatus);
  const queryString = params.toString();

  const { data: vehicles, isLoading } = useSWR<Vehicle[]>(
    `/api/vehicles${queryString ? `?${queryString}` : ''}`,
    fetcher
  );

  const handleAdd = async () => {
    setFormError('');
    if (!newVehicle.name.trim() || !newVehicle.licensePlate.trim() || !newVehicle.model.trim()) {
      setFormError('Name, license plate, and model are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVehicle,
          maxLoadCapacity: Number(newVehicle.maxLoadCapacity) || 0,
          currentOdometer: Number(newVehicle.currentOdometer) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Failed to add vehicle');
        return;
      }
      mutate((key: string) => typeof key === 'string' && key.startsWith('/api/vehicles'));
      setDialogOpen(false);
      setNewVehicle({ name: '', licensePlate: '', model: '', type: 'truck', maxLoadCapacity: '', currentOdometer: '', region: '' });
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    mutate((key: string) => typeof key === 'string' && key.startsWith('/api/vehicles'));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-900 text-green-200',
      on_trip: 'bg-blue-900 text-blue-200',
      in_shop: 'bg-orange-900 text-orange-200',
      out_of_service: 'bg-red-900 text-red-200',
    };
    return colors[status] || 'bg-slate-700 text-slate-200';
  };

  const canManageVehicles = userRole === 'Manager';
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
        {canManageVehicles && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription className="text-slate-400">Enter vehicle details to add to your fleet.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Vehicle Name</Label>
                    <Input placeholder="e.g. TR-020" value={newVehicle.name} onChange={e => setNewVehicle(p => ({ ...p, name: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">License Plate</Label>
                    <Input placeholder="e.g. MH02AB0020" value={newVehicle.licensePlate} onChange={e => setNewVehicle(p => ({ ...p, licensePlate: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Model</Label>
                    <Input placeholder="e.g. Volvo FH16" value={newVehicle.model} onChange={e => setNewVehicle(p => ({ ...p, model: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Type</Label>
                    <Select value={newVehicle.type} onValueChange={v => setNewVehicle(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Max Load (kg)</Label>
                    <Input type="number" placeholder="e.g. 25000" value={newVehicle.maxLoadCapacity} onChange={e => setNewVehicle(p => ({ ...p, maxLoadCapacity: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Region</Label>
                    <Input placeholder="e.g. West" value={newVehicle.region} onChange={e => setNewVehicle(p => ({ ...p, region: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" />
                  </div>
                </div>
                {formError && (
                  <div className="px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg">
                    <p className="text-sm text-red-300">{formError}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
                <Button onClick={handleAdd} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Vehicle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManageVehicles && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
          <Eye className="h-4 w-4 text-blue-400" />
          <p className="text-sm text-slate-400">
            You have <span className="text-blue-400 font-medium">read-only</span> access to vehicle data.
            {userRole === 'Dispatcher' && ' Use this view to check vehicle availability for trip assignments.'}
            {userRole === 'Safety Officer' && ' Use this view to review vehicle conditions and maintenance status.'}
          </p>
        </div>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-slate-300 block mb-2">Vehicle Type</label>
              <Select value={filterType || 'all'} onValueChange={val => setFilterType(val === 'all' ? '' : val)}>
                <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-slate-300 block mb-2">Status</label>
              <Select value={filterStatus || 'all'} onValueChange={val => setFilterStatus(val === 'all' ? '' : val)}>
                <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All status" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_trip">On Trip</SelectItem>
                  <SelectItem value="in_shop">In Shop</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">License Plate</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Capacity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Odometer</th>
                {canManageVehicles && <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(vehicles || []).map(vehicle => (
                <tr key={vehicle._id} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="py-3 px-4 text-white">{vehicle.name}</td>
                  <td className="py-3 px-4 text-slate-400">{vehicle.licensePlate}</td>
                  <td className="py-3 px-4 text-slate-400 capitalize">{vehicle.type}</td>
                  <td className="py-3 px-4 text-slate-400">{vehicle.maxLoadCapacity} kg</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{vehicle.currentOdometer} km</td>
                  {canManageVehicles && (
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => deleteVehicle(vehicle._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {(vehicles || []).length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500">No vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
