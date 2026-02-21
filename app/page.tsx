'use client';

import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ---- Animated dashed route lines ---- */
function RouteLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[18, 38, 58, 78].map((top, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-px w-full"
          style={{ top: `${top}%`, opacity: 0.07 + i * 0.01 }}
        >
          <div
            className="h-full w-[200%]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #0b1d3a 0px, #0b1d3a 18px, transparent 18px, transparent 48px)',
              animation: `slideRight ${20 + i * 5}s linear infinite`,
            }}
          />
        </div>
      ))}
      {[30, 60].map((left, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-px h-full"
          style={{ left: `${left}%`, opacity: 0.04 }}
        >
          <div
            className="w-full h-[200%]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, #0b1d3a 0px, #0b1d3a 10px, transparent 10px, transparent 36px)',
              animation: `slideDown ${24 + i * 6}s linear infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ---- Floating truck silhouettes ---- */
function FloatingTrucks() {
  const trucks = [
    { x: '8%', y: '25%', size: 24, dur: 32, delay: 0 },
    { x: '78%', y: '68%', size: 20, dur: 38, delay: 6 },
    { x: '88%', y: '22%', size: 16, dur: 26, delay: 12 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {trucks.map((t, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: t.x,
            top: t.y,
            animation: `float ${t.dur}s ease-in-out infinite`,
            animationDelay: `${t.delay}s`,
          }}
        >
          <svg
            width={t.size * 2.5}
            height={t.size}
            viewBox="0 0 60 24"
            fill="none"
          >
            <rect x="0" y="4" width="36" height="14" rx="2" fill="#0b1d3a" opacity="0.06" />
            <path d="M36 8h10a2 2 0 012 2v8H36V8z" fill="#0b1d3a" opacity="0.06" />
            <circle cx="12" cy="20" r="4" fill="#d4a017" opacity="0.10" />
            <circle cx="42" cy="20" r="4" fill="#d4a017" opacity="0.10" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ---- GPS tracking dots with connecting lines ---- */
function TrackingDots() {
  const dots = [
    { x: '12%', y: '28%', d: 0 },
    { x: '82%', y: '18%', d: 2 },
    { x: '22%', y: '72%', d: 4 },
    { x: '72%', y: '58%', d: 1 },
    { x: '48%', y: '12%', d: 3 },
    { x: '92%', y: '42%', d: 5 },
    { x: '6%', y: '52%', d: 2.5 },
    { x: '58%', y: '82%', d: 1.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot, i) => (
        <div key={i} className="absolute" style={{ left: dot.x, top: dot.y }}>
          <div
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundColor: 'rgba(212, 160, 23, 0.06)',
              animation: `ping 4s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${dot.d}s`,
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              backgroundColor: 'rgba(11, 29, 58, 0.18)',
              animation: `pulse 4s ease-in-out infinite`,
              animationDelay: `${dot.d}s`,
            }}
          />
        </div>
      ))}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <line x1="12%" y1="28%" x2="48%" y2="12%" stroke="#0b1d3a" strokeWidth="1" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="82%" y1="18%" x2="72%" y2="58%" stroke="#d4a017" strokeWidth="1" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="8s" repeatCount="indefinite" />
        </line>
        <line x1="22%" y1="72%" x2="58%" y2="82%" stroke="#0b1d3a" strokeWidth="1" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="6%" y1="52%" x2="22%" y2="72%" stroke="#d4a017" strokeWidth="1" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="5s" repeatCount="indefinite" />
        </line>
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        @keyframes slideRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes slideDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(25px, -12px) rotate(0.5deg); }
          50% { transform: translate(-18px, 8px) rotate(-0.5deg); }
          75% { transform: translate(12px, 18px) rotate(0.3deg); }
        }
      `}</style>

      <div className="h-screen bg-white text-[#0b1d3a] flex flex-col overflow-hidden">
        {/* Navbar - dark navy */}
        <header className="relative z-50 bg-[#0b1d3a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#d4a017] rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-[#0b1d3a]" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">FleetFlow</h1>
            </div>
          </div>
        </header>

        {/* Mustard accent line beneath navbar */}
        <div className="h-[3px] bg-gradient-to-r from-[#d4a017] via-[#e6b830] to-[#d4a017]" />

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center relative px-4">
          {/* Subtle background glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#d4a017]/[0.04] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[#0b1d3a]/[0.03] blur-[100px] pointer-events-none" />

          {/* Animated layers */}
          <RouteLines />
          <FloatingTrucks />
          <TrackingDots />

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance text-[#0b1d3a]">
              Fleet management,{' '}
              <span className="text-[#d4a017]">simplified</span>
            </h2>
            <p className="text-lg text-[#0b1d3a]/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              A centralized hub for managing vehicles, trips, drivers, maintenance,
              and fuel expenses with comprehensive analytics.
            </p>
            <Button
              size="lg"
              onClick={() => (window.location.href = '/login')}
              className="bg-[#0b1d3a] hover:bg-[#142c52] text-white rounded-xl px-10 h-13 text-base shadow-lg shadow-[#0b1d3a]/15 transition-all duration-300 hover:shadow-[#0b1d3a]/25"
            >
              Sign In
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </main>

        {/* Footer accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4a017]/30 to-transparent" />
      </div>
    </>
  );
}
