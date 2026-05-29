import { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '../components/PageHeader.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { getAdmins, createAdmin, deactivateAdmin } from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';
import {
  createSafeChangeHandler,
  sanitizeText,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/input-sanitizer.js';

export const SuperAdminAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await getAdmins();
      setAdmins(data);
      setError('');
    } catch (err) {
      setError('Error al cargar lista de administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = createSafeChangeHandler(setForm);

  const handlePasswordChange = (event) => {
    if (event.target.value.includes(' ')) {
      return; // prevent spaces
    }
    handleChange(event);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordErrors = validatePassword(form.password);

    if (nameError || emailError || passwordErrors.length > 0) {
      const messages = [nameError, emailError, ...passwordErrors].filter(Boolean);
      setFormError(messages.join('. '));
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: sanitizeText(form.name),
        email: sanitizeText(form.email).toLowerCase(),
        password: form.password,
      };

      await createAdmin(payload);
      toast.success('Administrador creado exitosamente');
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      loadAdmins();
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Error al crear administrador'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (adminId) => {
    if (!window.confirm('Seguro que deseas cambiar el estado de este administrador?')) {
      return;
    }
    try {
      await deactivateAdmin(adminId);
      toast.success('Estado actualizado');
      loadAdmins();
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError, 'No se pudo actualizar el estado'));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Gestion de Administradores"
          description="Crea nuevos administradores o desactiva accesos existentes."
        />
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nuevo Admin'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 mt-4 max-w-lg p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Crear nuevo administrador</h3>
          <form onSubmit={handleSubmit}>
            <ErrorMessage message={formError} />
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Nombre
              <Input
                className="mt-2"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Correo
              <Input
                className="mt-2"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Contrasena provisional
              <Input
                className="mt-2"
                name="password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={handlePasswordChange}
                required
              />
            </label>
            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Admin'}
            </Button>
          </form>
        </Card>
      )}

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingState text="Cargando administradores..." />
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-xs uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Correo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      {admin.name}
                    </td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge value={admin.isActive ? 'ACTIVO' : 'INACTIVO'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={admin.isActive ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleStatus(admin.id)}
                      >
                        {admin.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
