import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/Button';
import { LogOut, ShieldCheck } from 'lucide-react';

export const OnboardingLayout: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-2)] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--brand-magic-start)] to-[var(--brand-magic-mid)] flex items-center justify-center text-white font-black text-lg">
            V
          </div>
          <span className="font-extrabold tracking-tight text-lg text-white">
            Vidyut
          </span>
          <span className="text-xs bg-[var(--surface-3)] px-2 py-0.5 rounded-full text-[var(--text-tertiary)] border border-[var(--border-strong)] flex items-center gap-1 font-semibold ml-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--interactive-primary)]" />
            Verification Portal
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl my-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
