import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../utils/api-error.js';

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || '/dashboard';

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
      await login(form);
      toast.success('Sesion iniciada');
      navigate(from, { replace: true });
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo iniciar sesion.');
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
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription>Accede con tu correo y contrasena.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
        {location.state?.message && (
          <Alert variant="success">
            {location.state.message}
          </Alert>
        )}
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
        <label className="mt-5 block text-sm font-medium text-slate-700">
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
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          No tienes cuenta?{' '}
          <Link className="font-semibold text-slate-950 hover:underline" to="/register">
            Registrate
          </Link>
        </p>
      </form>
        </CardContent>
      </Card>
    </section>
  );
};
