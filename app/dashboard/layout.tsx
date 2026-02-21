'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, Truck, BarChart3, Settings, Users, Wrench, Fuel, MapPin, ShieldCheck, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Role-based navigation configuration
// Fleet Manager: Vehicles, Maintenance, Fleet Monitoring, Cost Monitoring, Analytics
// Dispatcher: Trips, Vehicles (for assignment), Drivers (for assignment)
// Safety Officer: Drivers (compliance/license), Analytics (safety metrics)
// Financial Analyst: Fuel Expenses, Maintenance (cost view), Analytics (financial reports)
const roleNavItems: Record<string, NavItem[]> = {
  Manager: [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Vehicles', href: '/dashboard/vehicles', icon: Truck },
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Fuel Expenses', href: '/dashboard/fuel', icon: Fuel },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  Dispatcher: [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Trips', href: '/dashboard/trips', icon: MapPin },
    { label: 'Vehicles', href: '/dashboard/vehicles', icon: Truck },
    { label: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  'Safety Officer': [
    { label: 'Dashboard', href: '/dashboard', icon: ShieldCheck },
    { label: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { label: 'Vehicles', href: '/dashboard/vehicles', icon: Truck },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
  'Financial Analyst': [
    { label: 'Dashboard', href: '/dashboard', icon: DollarSign },
    { label: 'Fuel Expenses', href: '/dashboard/fuel', icon: Fuel },
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Reports', href: '/dashboard/reports', icon: FileText },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ],
};

// Pages each role is allowed to access
const roleAllowedPaths: Record<string, string[]> = {
  Manager: ['/dashboard', '/dashboard/vehicles', '/dashboard/maintenance', '/dashboard/fuel', '/dashboard/analytics', '/dashboard/settings'],
  Dispatcher: ['/dashboard', '/dashboard/trips', '/dashboard/vehicles', '/dashboard/drivers', '/dashboard/settings'],
  'Safety Officer': ['/dashboard', '/dashboard/drivers', '/dashboard/vehicles', '/dashboard/analytics', '/dashboard/settings'],
  'Financial Analyst': ['/dashboard', '/dashboard/fuel', '/dashboard/maintenance', '/dashboard/analytics', '/dashboard/reports', '/dashboard/settings'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ email: 'admin@fleetflow.com', role: 'Manager' });
  const [mounted, setMounted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    try {
      const email = sessionStorage.getItem('userEmail') || 'admin@fleetflow.com';
      const role = sessionStorage.getItem('userRole') || 'Manager';
      console.log("[v0] DashboardLayout mounted, role:", role, "email:", email);
      setUser({ email, role });
      setMounted(true);
    } catch (err) {
      console.log("[v0] DashboardLayout mount error:", err);
      setMounted(true);
    }
  }, []);

  // Check page access when pathname or role changes
  useEffect(() => {
    if (!mounted) return;
    const allowed = roleAllowedPaths[user.role] || roleAllowedPaths['Manager'];
    if (!allowed.includes(pathname)) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [pathname, user.role, mounted]);

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    router.push('/login');
  };

  const navItems = roleNavItems[user.role] || roleNavItems['Manager'];

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      Manager: 'Fleet Manager',
      Dispatcher: 'Dispatcher',
      'Safety Officer': 'Safety Officer',
      'Financial Analyst': 'Financial Analyst',
    };
    return labels[role] || role;
  };

  const SidebarContent = () => (
    <nav className="space-y-1">
      <div className="px-3 py-2 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {getRoleLabel(user.role)}
        </p>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={`w-full justify-start transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setOpen(false)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-slate-800 border-slate-700">
                <div className="mt-4">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-2xl font-bold text-white">FleetFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs text-blue-400">{getRoleLabel(user.role)}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-slate-700 bg-slate-800 min-h-[calc(100vh-57px)]">
          <div className="p-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {accessDenied ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
                <p className="text-slate-400 mb-6">
                  Your role as <span className="text-blue-400 font-medium">{getRoleLabel(user.role)}</span> does not have permission to access this page.
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
