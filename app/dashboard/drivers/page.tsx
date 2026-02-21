'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Users, Plus, Eye, AlertTriangle, Ban, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type DriverStatus = 'on_duty' | 'off_duty' | 'suspended';
type LicenseStatus = 'valid' | 'expiring' | 'expired';

interface Driver {
  _id: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  tripsCompleted: number;
  tripsAssigned: number;
  status: DriverStatus;
}

function getLicenseStatus(expiryDate: string): LicenseStatus {
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days < 30) return 'expiring';
  return 'valid';
}

function getDaysUntilExpiry(expiryDate: string): number {
  return Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isDriverAssignable(driver: Driver): boolean {
  return driver.status === 'on_duty' && getLicenseStatus(driver.licenseExpiry) !== 'expired';
}

function getCompletionRate(driver: Driver): string {
  if (driver.tripsAssigned === 0) return 'N/A';
  return ((driver.tripsCompleted / driver.tripsAssigned) * 100).toFixed(0);
}

function getRiskLevel(driver: Driver): 'high' | 'medium' | 'low' {
  const license = getLicenseStatus(driver.licenseExpiry);
  if (license === 'expired' || driver.safetyScore < 70 || driver.status === 'suspended') return 'high';
  if (license === 'expiring' || driver.safetyScore < 80) return 'medium';
  return 'low';
}

const rolePageConfig: Record<string, { title: string; description: string }> = {
  Dispatcher: { title: 'Driver Assignment Pool', description: 'View available drivers for trip assignments' },
  'Safety Officer': { title: 'Driver Compliance & Safety', description: 'Verify licenses, manage statuses, monitor safety scores, and prevent risk' },
};

export default function DriversPage() {
  const [userRole, setUserRole] = useState('Dispatcher');
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [newStatus, setNewStatus] = useState<DriverStatus>('on_duty');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newDriver, setNewDriver] = useState({ name: '', email: '', licenseNumber: '', licenseExpiry: '' });

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'Dispatcher';
    setUserRole(role);
    setMounted(true);
  }, []);

  const { data: drivers = [], isLoading } = useSWR<Driver[]>('/api/drivers', fetcher);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      if (filterStatus && d.status !== filterStatus) return false;
      if (filterRisk && getRiskLevel(d) !== filterRisk) return false;
      return true;
    });
  }, [drivers, filterStatus, filterRisk]);

  const stats = useMemo(() => ({
    total: drivers.length,
    onDuty: drivers.filter(d => d.status === 'on_duty').length,
    offDuty: drivers.filter(d => d.status === 'off_duty').length,
    suspended: drivers.filter(d => d.status === 'suspended').length,
    expiredLicenses: drivers.filter(d => getLicenseStatus(d.licenseExpiry) === 'expired').length,
    expiringLicenses: drivers.filter(d => getLicenseStatus(d.licenseExpiry) === 'expiring').length,
    highRisk: drivers.filter(d => getRiskLevel(d) === 'high').length,
    avgSafety: drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length).toFixed(1) : '0.0',
    assignable: drivers.filter(d => isDriverAssignable(d)).length,
  }), [drivers]);

  const handleStatusChange = async () => {
    if (!selectedDriver) return;
    setSubmitting(true);
    await fetch(`/api/drivers/${selectedDriver._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate('/api/drivers');
    setStatusDialogOpen(false);
    setSelectedDriver(null);
    setSubmitting(false);
  };

  const openStatusDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setNewStatus(driver.status);
    setStatusDialogOpen(true);
  };

  const handleAddDriver = async () => {
    setFormError('');
    if (!newDriver.name.trim() || !newDriver.email.trim() || !newDriver.licenseNumber.trim() || !newDriver.licenseExpiry) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Failed to add driver');
        return;
      }
      mutate('/api/drivers');
      setAddDialogOpen(false);
      setNewDriver({ name: '', email: '', licenseNumber: '', licenseExpiry: '' });
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const canManageDrivers = userRole === 'Safety Officer';
  const pageConfig = rolePageConfig[userRole] || rolePageConfig['Dispatcher'];

  const getStatusConfig = (status: DriverStatus) => {
    const configs: Record<DriverStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
      on_duty: { label: 'On Duty', bg: 'bg-green-900/60', text: 'text-green-200', icon: <CheckCircle className="h-3 w-3" /> },
      off_duty: { label: 'Off Duty', bg: 'bg-slate-600', text: 'text-slate-200', icon: <Clock className="h-3 w-3" /> },
      suspended: { label: 'Suspended', bg: 'bg-red-900/60', text: 'text-red-200', icon: <Ban className="h-3 w-3" /> },
    };
    return configs[status];
  };

  const getLicenseBadge = (expiryDate: string) => {
    const status = getLicenseStatus(expiryDate);
    const days = getDaysUntilExpiry(expiryDate);
    switch (status) {
      case 'expired': return { label: `Expired (${Math.abs(days)}d ago)`, bg: 'bg-red-900/60', text: 'text-red-200', icon: <XCircle className="h-3 w-3" /> };
      case 'expiring': return { label: `Expiring (${days}d)`, bg: 'bg-yellow-900/60', text: 'text-yellow-200', icon: <AlertTriangle className="h-3 w-3" /> };
      case 'valid': return { label: 'Valid', bg: 'bg-green-900/60', text: 'text-green-200', icon: <CheckCircle className="h-3 w-3" /> };
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSafetyBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBadge = (driver: Driver) => {
    const level = getRiskLevel(driver);
    switch (level) {
      case 'high': return { label: 'High Risk', bg: 'bg-red-900/40', text: 'text-red-300', border: 'border-red-800/50' };
      case 'medium': return { label: 'Medium Risk', bg: 'bg-yellow-900/40', text: 'text-yellow-300', border: 'border-yellow-800/50' };
      case 'low': return { label: 'Low Risk', bg: 'bg-green-900/40', text: 'text-green-300', border: 'border-green-800/50' };
    }
  };

  if (!mounted) {
    return <div className="p-6"><div className="text-center text-slate-400">Loading...</div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{pageConfig.title}</h1>
          <p className="text-slate-400">{pageConfig.description}</p>
        </div>
        {canManageDrivers && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="mr-2 h-4 w-4" />Add Driver</Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription className="text-slate-400">Enter driver details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label className="text-slate-300">Full Name</Label><Input placeholder="e.g. John Doe" value={newDriver.name} onChange={e => setNewDriver(p => ({ ...p, name: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                <div className="space-y-2"><Label className="text-slate-300">Email</Label><Input type="email" placeholder="e.g. john@example.com" value={newDriver.email} onChange={e => setNewDriver(p => ({ ...p, email: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label className="text-slate-300">License Number</Label><Input placeholder="e.g. DL-2024-007" value={newDriver.licenseNumber} onChange={e => setNewDriver(p => ({ ...p, licenseNumber: e.target.value }))} className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
                  <div className="space-y-2"><Label className="text-slate-300">License Expiry</Label><Input type="date" value={newDriver.licenseExpiry} onChange={e => setNewDriver(p => ({ ...p, licenseExpiry: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" /></div>
                </div>
                {formError && <div className="px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg"><p className="text-sm text-red-300">{formError}</p></div>}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setAddDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
                <Button onClick={handleAddDriver} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Driver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {userRole === 'Dispatcher' && (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
          <Eye className="h-4 w-4 text-blue-400 shrink-0" />
          <p className="text-sm text-slate-400">You have <span className="text-blue-400 font-medium">read-only</span> access. Drivers marked as assignable have a valid license and are on duty.</p>
        </div>
      )}

      {canManageDrivers && stats.expiredLicenses > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">{stats.expiredLicenses} driver{stats.expiredLicenses > 1 ? 's have' : ' has'} an expired license</p>
            <p className="text-xs text-red-400/80 mt-0.5">Drivers with expired licenses are automatically blocked from trip assignment.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {canManageDrivers ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'On Duty', value: stats.onDuty, color: 'text-green-400' },
            { label: 'Off Duty', value: stats.offDuty, color: 'text-slate-300' },
            { label: 'Suspended', value: stats.suspended, color: 'text-red-400' },
            { label: 'Expired License', value: stats.expiredLicenses, color: 'text-red-400' },
            { label: 'Avg Safety', value: stats.avgSafety, color: 'text-white' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="py-4 px-4">
                <p className="text-xs text-slate-400">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Drivers', value: stats.total, color: 'text-white' },
            { label: 'Assignable', value: stats.assignable, color: 'text-green-400' },
            { label: 'Off Duty', value: stats.offDuty, color: 'text-slate-300' },
            { label: 'Avg Safety', value: stats.avgSafety, color: 'text-white' },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-slate-800 border-slate-700">
              <CardContent className="py-4 px-4">
                <p className="text-xs text-slate-400">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {canManageDrivers && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm text-slate-300 block mb-2">Driver Status</label>
                <Select value={filterStatus || 'all'} onValueChange={val => setFilterStatus(val === 'all' ? '' : val)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="on_duty">On Duty</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm text-slate-300 block mb-2">Risk Level</label>
                <Select value={filterRisk || 'all'} onValueChange={val => setFilterRisk(val === 'all' ? '' : val)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue placeholder="All risk levels" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All risk levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No drivers match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrivers.map(driver => {
            const statusConfig = getStatusConfig(driver.status);
            const licenseBadge = getLicenseBadge(driver.licenseExpiry);
            const riskBadge = getRiskBadge(driver);
            const assignable = isDriverAssignable(driver);
            const completionRate = getCompletionRate(driver);

            return (
              <Card key={driver._id} className={`bg-slate-800 border-slate-700 ${getRiskLevel(driver) === 'high' && canManageDrivers ? 'border-l-2 border-l-red-500' : ''}`}>
                <CardContent className="py-5 px-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="lg:w-48 shrink-0">
                      <p className="font-semibold text-white">{driver.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{driver.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.icon}{statusConfig.label}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${licenseBadge.bg} ${licenseBadge.text}`}>{licenseBadge.icon}{licenseBadge.label}</span>
                      {canManageDrivers && <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${riskBadge.bg} ${riskBadge.text} border ${riskBadge.border}`}>{riskBadge.label}</span>}
                      {!canManageDrivers && assignable && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300"><CheckCircle className="h-3 w-3" />Assignable</span>}
                      {!canManageDrivers && !assignable && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400"><Ban className="h-3 w-3" />Not Assignable</span>}
                    </div>
                    <div className="flex items-center gap-5 lg:ml-auto">
                      <div className="text-center"><p className="text-xs text-slate-500">License</p><p className="text-xs text-slate-300 font-mono">{driver.licenseNumber}</p></div>
                      <div className="text-center"><p className="text-xs text-slate-500">Safety</p><p className={`text-sm font-bold ${getSafetyScoreColor(driver.safetyScore)}`}>{driver.safetyScore}</p></div>
                      <div className="text-center"><p className="text-xs text-slate-500">Trips</p><p className="text-sm font-medium text-slate-200">{driver.tripsCompleted}/{driver.tripsAssigned}</p></div>
                      <div className="text-center"><p className="text-xs text-slate-500">Rate</p><p className="text-sm font-medium text-slate-200">{completionRate}{completionRate !== 'N/A' ? '%' : ''}</p></div>
                    </div>
                    {canManageDrivers && (
                      <div className="lg:ml-4 shrink-0">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700" onClick={() => openStatusDialog(driver)}>Change Status</Button>
                      </div>
                    )}
                  </div>
                  {canManageDrivers && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-20 shrink-0">Safety Score</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${getSafetyBarColor(driver.safetyScore)}`} style={{ width: `${driver.safetyScore}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-8 text-right ${getSafetyScoreColor(driver.safetyScore)}`}>{driver.safetyScore}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Driver Status</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedDriver && <>Update status for <span className="text-white font-medium">{selectedDriver.name}</span>.</>}
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Current Status</span><span className={`${getStatusConfig(selectedDriver.status).text} font-medium`}>{getStatusConfig(selectedDriver.status).label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">License</span><span className={getLicenseBadge(selectedDriver.licenseExpiry).text}>{getLicenseBadge(selectedDriver.licenseExpiry).label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Safety Score</span><span className={getSafetyScoreColor(selectedDriver.safetyScore)}>{selectedDriver.safetyScore}</span></div>
              </div>
              {getLicenseStatus(selectedDriver.licenseExpiry) === 'expired' && newStatus === 'on_duty' && (
                <div className="flex items-start gap-2 px-3 py-2 bg-red-900/30 border border-red-800/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">This driver has an expired license. Setting to On Duty will not make them assignable.</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">New Status</label>
                <Select value={newStatus} onValueChange={v => setNewStatus(v as DriverStatus)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="on_duty">On Duty</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setStatusDialogOpen(false)} className="text-slate-300 hover:text-white">Cancel</Button>
            <Button onClick={handleStatusChange} disabled={submitting} className={newStatus === 'suspended' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {newStatus === 'suspended' ? 'Suspend Driver' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
