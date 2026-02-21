'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Plus, MapPin, Truck, Users, ArrowRight, Send, CheckCircle, XCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled';

interface Trip {
  _id: string;
  tripId: string;
  vehicleId: { _id: string; name: string; maxLoadCapacity: number; status: string } | null;
  driverId: { _id: string; name: string; status: string } | null;
  cargoWeight: number;
  startLocation: string;
  endLocation: string;
  status: TripStatus;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  name: string;
  maxLoadCapacity: number;
  status: string;
}

interface Driver {
  _id: string;
  name: string;
  status: string;
}

const allowedTransitions: Record<TripStatus, TripStatus[]> = {
  draft: ['dispatched', 'cancelled'],
  dispatched: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function TripsPage() {
  const [userRole, setUserRole] = useState('Dispatcher');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newTrip, setNewTrip] = useState({ startLocation: '', endLocation: '', cargoWeight: '', vehicleId: '', driverId: '' });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Dispatcher';
    setUserRole(role);
  }, []);

  const { data: trips = [], isLoading: tripsLoading } = useSWR<Trip[]>('/api/trips', fetcher);
  const { data: allVehicles = [] } = useSWR<Vehicle[]>('/api/vehicles', fetcher);
  const { data: allDrivers = [] } = useSWR<Driver[]>('/api/drivers', fetcher);

  const availableVehicles = allVehicles.filter(v => v.status === 'available');
  const availableDrivers = allDrivers.filter(d => d.status === 'on_duty');

  const filteredTrips = filterStatus ? trips.filter(t => t.status === filterStatus) : trips;

  const tripCounts = useMemo(() => ({
    draft: trips.filter(t => t.status === 'draft').length,
    dispatched: trips.filter(t => t.status === 'dispatched').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
    total: trips.length,
  }), [trips]);

  const selectedVehicle = allVehicles.find(v => v._id === newTrip.vehicleId);
  const cargoNum = parseFloat(newTrip.cargoWeight);
  const isOverCapacity = selectedVehicle && !isNaN(cargoNum) && cargoNum > selectedVehicle.maxLoadCapacity;

  const handleCreateTrip = async () => {
    setFormError('');
    if (!newTrip.startLocation.trim() || !newTrip.endLocation.trim()) { setFormError('Pickup and destination are required.'); return; }
    if (isNaN(cargoNum) || cargoNum <= 0) { setFormError('Cargo weight must be a positive number.'); return; }
    if (!newTrip.vehicleId) { setFormError('Please assign a vehicle.'); return; }
    if (!newTrip.driverId) { setFormError('Please assign a driver.'); return; }
    if (isOverCapacity) { setFormError(`Cargo weight exceeds vehicle capacity.`); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: newTrip.vehicleId,
          driverId: newTrip.driverId,
          cargoWeight: cargoNum,
          startLocation: newTrip.startLocation.trim(),
          endLocation: newTrip.endLocation.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Failed to create trip');
        return;
      }
      mutate('/api/trips');
      setDialogOpen(false);
      setNewTrip({ startLocation: '', endLocation: '', cargoWeight: '', vehicleId: '', driverId: '' });
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (tripId: string, newStatus: TripStatus) => {
    await fetch(`/api/trips/${tripId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate('/api/trips');
    mutate('/api/vehicles');
    mutate('/api/drivers');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-slate-600 text-slate-200', dispatched: 'bg-blue-900/80 text-blue-200', completed: 'bg-green-900/80 text-green-200', cancelled: 'bg-red-900/80 text-red-200' };
    return colors[status] || 'bg-slate-700 text-slate-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-3.5 w-3.5" />;
      case 'dispatched': return <Send className="h-3.5 w-3.5" />;
      case 'completed': return <CheckCircle className="h-3.5 w-3.5" />;
      case 'cancelled': return <XCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getTransitionLabel = (status: TripStatus) => {
    switch (status) {
      case 'dispatched': return { label: 'Dispatch', className: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'completed': return { label: 'Complete', className: 'bg-green-600 hover:bg-green-700 text-white' };
      case 'cancelled': return { label: 'Cancel', className: 'bg-red-600 hover:bg-red-700 text-white' };
      default: return { label: status, className: '' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Trip Dispatcher</h1>
          <p className="text-slate-400">Create, assign, and manage delivery operations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="mr-2 h-4 w-4" />New Trip</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription className="text-slate-400">Enter trip details, assign a vehicle and driver.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label className="text-slate-300">Pickup Location</Label><Input placeholder="e.g. Warehouse A" value={newTrip.startLocation} onChange={e => setNewTrip(p => ({ ...p, startLocation: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                <div className="space-y-2"><Label className="text-slate-300">Destination</Label><Input placeholder="e.g. Store B" value={newTrip.endLocation} onChange={e => setNewTrip(p => ({ ...p, endLocation: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
              </div>
              <div className="space-y-2"><Label className="text-slate-300">Cargo Weight (kg)</Label><Input type="number" placeholder="e.g. 5000" value={newTrip.cargoWeight} onChange={e => setNewTrip(p => ({ ...p, cargoWeight: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
              <div className="space-y-2">
                <Label className="text-slate-300">Assign Vehicle</Label>
                <Select value={newTrip.vehicleId} onValueChange={v => setNewTrip(p => ({ ...p, vehicleId: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Select an available vehicle" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {availableVehicles.length === 0 ? <SelectItem value="__none" disabled>No vehicles available</SelectItem> : availableVehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.name} -- Capacity: {v.maxLoadCapacity.toLocaleString()} kg</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {isOverCapacity && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">Cargo weight exceeds vehicle capacity</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-slate-300">Assign Driver</Label>
                <Select value={newTrip.driverId} onValueChange={v => setNewTrip(p => ({ ...p, driverId: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Select an available driver" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {availableDrivers.length === 0 ? <SelectItem value="__none" disabled>No drivers available</SelectItem> : availableDrivers.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {formError && <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg"><AlertTriangle className="h-4 w-4 text-red-400 shrink-0" /><p className="text-sm text-red-300">{formError}</p></div>}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
              <Button onClick={handleCreateTrip} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create as Draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: tripCounts.total, color: 'text-white' },
          { label: 'Draft', value: tripCounts.draft, color: 'text-slate-300' },
          { label: 'Dispatched', value: tripCounts.dispatched, color: 'text-blue-400' },
          { label: 'Completed', value: tripCounts.completed, color: 'text-green-400' },
          { label: 'Cancelled', value: tripCounts.cancelled, color: 'text-red-400' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-slate-800 border-slate-700">
            <CardContent className="py-4 px-4">
              <p className="text-xs text-slate-400">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/50"><Truck className="h-5 w-5 text-blue-400" /></div>
            <div>
              <p className="text-sm text-slate-400">Available Vehicles</p>
              <p className="text-lg font-bold text-white">{availableVehicles.length} <span className="text-sm font-normal text-slate-500">/ {allVehicles.length}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-4 px-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-900/50"><Users className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-sm text-slate-400">Available Drivers</p>
              <p className="text-lg font-bold text-white">{availableDrivers.length} <span className="text-sm font-normal text-slate-500">/ {allDrivers.length}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="w-full md:w-64">
            <label className="text-sm text-slate-300 block mb-2">Filter by Status</label>
            <Select value={filterStatus || 'all'} onValueChange={val => setFilterStatus(val === 'all' ? '' : val)}>
              <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trip Cards */}
      {tripsLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12"><MapPin className="h-10 w-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No trips match the current filter.</p></div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map(trip => {
            const transitions = allowedTransitions[trip.status];
            const vehicleName = trip.vehicleId?.name || 'Unknown';
            const vehicleCapacity = trip.vehicleId?.maxLoadCapacity || 0;
            const driverName = trip.driverId?.name || 'Unknown';

            return (
              <Card key={trip._id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{trip.tripId}</CardTitle>
                      <CardDescription className="text-slate-500 text-xs mt-1">Created {new Date(trip.createdAt).toLocaleString()}</CardDescription>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusIcon(trip.status)}{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                      <div className="flex items-center gap-1.5 text-sm text-slate-200">
                        <span>{trip.startLocation}</span><ArrowRight className="h-3.5 w-3.5 text-slate-500" /><span>{trip.endLocation}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-blue-400" /><span className="text-slate-300">{vehicleName}</span></div>
                      <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-green-400" /><span className="text-slate-300">{driverName}</span></div>
                    </div>
                    <div className="text-sm text-slate-300">
                      Cargo: <span className="font-medium text-white">{trip.cargoWeight.toLocaleString()} kg</span>
                      <span className="text-slate-500"> / {vehicleCapacity.toLocaleString()} kg</span>
                    </div>
                  </div>
                  {transitions.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
                      <span className="text-xs text-slate-500 mr-1">Actions:</span>
                      {transitions.map(nextStatus => {
                        const t = getTransitionLabel(nextStatus);
                        return (
                          <Button key={nextStatus} size="sm" className={t.className} onClick={() => handleStatusChange(trip._id, nextStatus)}>
                            {getStatusIcon(nextStatus)}<span className="ml-1.5">{t.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
