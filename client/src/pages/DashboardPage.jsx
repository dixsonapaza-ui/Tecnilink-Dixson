import { Link } from 'react-router-dom';
import { ClipboardList, FolderTree, ShieldCheck, TicketCheck, UserCircle } from 'lucide-react';

import { PageHeader } from '../components/PageHeader.jsx';
import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const roleContent = {
  ADMIN: {
    title: 'Panel de administrador',
    description: 'Gestiona categorias, revisa todas las solicitudes y asigna tecnicos.',
    icon: ShieldCheck,
    actions: [
      { label: 'Ver solicitudes', to: '/requests' },
      { label: 'Gestionar categorias', to: '/categories' },
    ],
  },
  CLIENTE: {
    title: 'Panel de cliente',
    description: 'Crea solicitudes tecnicas y consulta el estado de tus casos.',
    icon: TicketCheck,
    actions: [
      { label: 'Crear solicitud', to: '/requests/new' },
      { label: 'Mis solicitudes', to: '/requests' },
    ],
  },
  TECNICO: {
    title: 'Panel de tecnico',
    description: 'Consulta solicitudes asignadas y actualiza su estado de atencion.',
    icon: ClipboardList,
    actions: [{ label: 'Ver asignaciones', to: '/requests' }],
  },
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const content = roleContent[user.role];
  const RoleIcon = content.icon;

  return (
    <div>
      <PageHeader title={content.title} description={content.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-5 w-5 text-slate-500" />
              Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-950">{user.name}</p>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RoleIcon className="h-5 w-5 text-slate-500" />
              Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-slate-950">{user.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-5 w-5 text-slate-500" />
              Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-emerald-700">Activo</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {content.actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={buttonVariants()}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
