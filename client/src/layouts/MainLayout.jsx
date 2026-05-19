import { Outlet } from 'react-router-dom';

export const MainLayout = () => (
  <main className="min-h-screen bg-slate-50 text-slate-950">
    <Outlet />
  </main>
);
