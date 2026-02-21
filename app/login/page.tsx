'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, TrendingUp, Truck, Shield, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoUsers: Record<string, { password: string; role: string }> = {
    'manager@fleetflow.com': { password: 'manager123', role: 'Manager' },
    'dispatcher@fleetflow.com': { password: 'dispatcher123', role: 'Dispatcher' },
    'safety@fleetflow.com': { password: 'safety123', role: 'Safety Officer' },
    'finance@fleetflow.com': { password: 'finance123', role: 'Financial Analyst' },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = demoUsers[email];
      if (!user || user.password !== password) {
        setError('Invalid email or password. Please check your credentials.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userEmail', email);
      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0e1a]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1424] via-[#0a1628] to-[#0a0e1a]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-60 h-60 rounded-full bg-cyan-500/5 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FleetFlow</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 text-balance">
            Manage your fleet with precision and clarity.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            Real-time tracking, intelligent analytics, and streamlined operations — all in one platform.
          </p>

          {/* Stats row */}
          <div className="mt-12 flex gap-10">
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-slate-500 mt-1">Fleet uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">2.4x</div>
              <div className="text-sm text-slate-500 mt-1">Efficiency gain</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">30%</div>
              <div className="text-sm text-slate-500 mt-1">Cost reduction</div>
            </div>
          </div>
        </div>

        {/* Bottom trust indicators */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield size={16} />
            <span className="text-sm">Enterprise-grade security</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Truck size={16} />
            <span className="text-sm">Trusted by 500+ fleets</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FleetFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-[#111827] border-[#1e293b] text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-[#111827] border-[#1e293b] text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl mt-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-8">
            {'By signing in, you agree to our '}
            <span className="text-slate-400 hover:text-white transition cursor-pointer">Terms of Service</span>
            {' and '}
            <span className="text-slate-400 hover:text-white transition cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
