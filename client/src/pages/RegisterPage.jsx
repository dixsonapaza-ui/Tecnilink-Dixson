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
import {
  createSafeChangeHandler,
  sanitizeText,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/input-sanitizer.js';

export const RegisterPage = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpaceAttempted, setIsSpaceAttempted] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = createSafeChangeHandler(setForm);

  const handlePasswordChange = (event) => {
    if (event.target.value.includes(' ')) {
      setIsSpaceAttempted(true);
      setTimeout(() => setIsSpaceAttempted(false), 2500);
      return;
    }
    handleChange(event);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordErrors = validatePassword(form.password);

    if (nameError || emailError || passwordErrors.length > 0) {
      const messages = [nameError, emailError, ...passwordErrors].filter(Boolean);
      setError(messages.join('. '));
      setIsSubmitting(false);
      return;
    }

    const sanitizedForm = {
      name: sanitizeText(form.name),
      email: sanitizeText(form.email).toLowerCase(),
      password: form.password,
    };

    try {
      await register(sanitizedForm);
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
            className={`mt-2 transition-colors duration-300 ${isSpaceAttempted ? '!border-red-500 bg-red-50 ring-2 ring-red-500/20' : ''}`}
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
