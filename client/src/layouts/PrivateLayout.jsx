import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  PlusCircle,
  ShieldAlert,
  UserCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`;

export const PrivateLayout = () => {
  const { logout, user } = useAuth();
  const handleLogout = () => {
    logout();
    toast.success('Sesion cerrada');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requests', label: 'Solicitudes', icon: ClipboardList },
    ...(user?.role === 'CLIENTE'
      ? [{ to: '/requests/new', label: 'Nueva solicitud', icon: PlusCircle }]
      : []),
    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? [{ to: '/categories', label: 'Categorias', icon: FolderTree }]
      : []),
    ...(user?.role === 'SUPER_ADMIN'
      ? [
          { to: '/superadmin/metrics', label: 'Metricas Globales', icon: PieChart },
          { to: '/superadmin/admins', label: 'Gestion Admins', icon: Users },
          { to: '/superadmin/audit', label: 'Auditoria', icon: ShieldAlert },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
                <Activity className="h-5 w-5" />
              </span>
              <span>Tecnilink</span>
            </Link>
            <div className="hidden flex-wrap gap-1 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={navLinkClass}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-slate-500">
                  {user?.email} - {user?.role}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to} className="flex w-full items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </section>
    </main>
  );
};
