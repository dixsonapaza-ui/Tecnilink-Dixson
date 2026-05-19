import { Link, Outlet } from 'react-router-dom';
import { Activity, LogIn } from 'lucide-react';

import { buttonVariants } from '../components/ui/button.jsx';
import { cn } from '../lib/utils.js';

export const PublicLayout = () => (
  <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
            <Activity className="h-5 w-5" />
          </span>
          <span>Tecnilink</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden sm:inline-flex')}>
            <LogIn className="h-4 w-4" />
            Iniciar sesion
          </Link>
          <Link to="/register" className={buttonVariants()}>
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
    <Outlet />
  </main>
);
