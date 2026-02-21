'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const nameMap: Record<string, string> = {
    'Manager': 'Fleet Manager',
    'Dispatcher': 'Dispatcher',
    'Safety Officer': 'Safety Officer',
    'Financial Analyst': 'Financial Analyst',
  };

  const [user, setUser] = useState({
    id: 'user_001',
    name: 'Fleet Manager',
    email: 'admin@fleetflow.com',
    role: 'Manager',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || 'admin@fleetflow.com';
    const role = sessionStorage.getItem('userRole') || 'Manager';
    setUser(prev => ({
      ...prev,
      email,
      role,
      name: nameMap[role] || 'User',
    }));
    setMounted(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and system preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Role</label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">User ID</label>
                <input
                  type="text"
                  value={user.id}
                  disabled
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-300 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>FleetFlow system details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">System Name</span>
              <span className="text-white font-semibold">FleetFlow</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-white font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database</span>
              <span className="text-white font-semibold">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Framework</span>
              <span className="text-white font-semibold">React + TypeScript</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Manage your login session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
            <p className="text-sm text-slate-400 mt-3">
              Click the button above to logout from your account and return to the login page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
