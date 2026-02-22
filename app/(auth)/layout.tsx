import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-surface p-12 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-2xl text-white">Prohori</span>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-display font-bold text-white mb-6">
            Digital Resilience Suite for Smart Bangladesh
          </h1>
          <p className="text-text-muted text-lg">
            AI-powered threat detection, CSA 2023 compliance, and real-time monitoring — all in one accessible platform meant for growing businesses.
          </p>
        </div>

        <div className="relative z-10 text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Prohori Security. All rights reserved.
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-white">Prohori</span>
        </div>
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
