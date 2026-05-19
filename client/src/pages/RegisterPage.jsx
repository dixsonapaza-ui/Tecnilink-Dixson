import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../utils/api-error.js';

export const RegisterPage = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form);
      toast.success('Cuenta creada');
      navigate('/login', {
        replace: true,
        state: { message: 'Cuenta creada correctamente. Ahora inicia sesion.' },
      });
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo registrar el usuario.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Crear cuenta cliente</CardTitle>
          <CardDescription>El registro publico siempre crea usuarios con rol CLIENTE.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <ErrorMessage message={error} />
        <label className="mt-5 block text-sm font-medium text-slate-700">
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
          Contrasena
          <Input
            className="mt-2"
            name="password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={isSubmitting}
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Ya tienes cuenta?{' '}
          <Link className="font-semibold text-slate-950 hover:underline" to="/login">
            Inicia sesion
          </Link>
        </p>
      </form>
        </CardContent>
      </Card>
    </section>
  );
};
