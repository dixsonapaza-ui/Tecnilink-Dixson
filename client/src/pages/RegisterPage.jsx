import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Zap, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Input } from '../components/ui/input.jsx';
import { NetworkBackground } from '../components/NetworkBackground.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleAuthModal } from '../components/GoogleAuthModal.jsx';
import { getApiErrorMessage } from '../utils/api-error.js';
import { registerTechnician as registerTechnicianApi } from '../services/api.js';
import { GoogleLogin } from '@react-oauth/google';
import {
  createSafeChangeHandler,
  sanitizeText,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/input-sanitizer.js';

/* ── animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ── component ── */
export const RegisterPage = () => {
  const { isAuthenticated, register, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(roleParam === 'TECNICO' ? 'TECNICO' : 'CLIENTE');

  useEffect(() => {
    if (roleParam === 'TECNICO') {
      setSelectedRole('TECNICO');
    } else if (roleParam === 'CLIENTE') {
      setSelectedRole('CLIENTE');
    }
  }, [roleParam]);

  const isTechnician = selectedRole === 'TECNICO';
  const [form, setForm] = useState({ name: '', email: '', password: '', dni: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpaceAttempted, setIsSpaceAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'TECNICO') {
      toast.info('Modo Técnico Seleccionado', {
        description: 'Las cuentas de técnico requieren DNI oficial para la verificación automática con RENIEC. El registro rápido con Google no está disponible.',
        duration: 6000,
      });
    } else {
      toast.success('Modo Cliente Seleccionado', {
        description: 'Puedes completar el formulario o registrarte rápidamente usando tu cuenta de Google.',
        duration: 4000,
      });
    }
  };

  const handleGoogleAuthenticate = async (credential) => {
    setError('');
    try {
      await loginGoogle({ credential });
      toast.success('Sesion iniciada con Google');
      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudo registrar/iniciar sesion con Google.');
      setError(message);
      toast.error(message);
    }
  };

  const handleMockGoogleAuthenticate = async ({ name, email }) => {
    // Construct a mock JWT credential token that ends with .mock-signature for development mode
    const payloadObj = {
      name,
      email,
      email_verified: true,
      sub: 'mock-' + email.replace(/[^a-zA-Z0-9]/g, ''),
      picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
    };
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payload = window.btoa(unescape(encodeURIComponent(JSON.stringify(payloadObj))));
    const signature = 'mock-signature';
    const fakeCredential = `${header}.${payload}.${signature}`;

    await handleGoogleAuthenticate(fakeCredential);
  };

  const hasMinLength = form.password.length >= 8;
  const hasLowerCase = /[a-z]/.test(form.password);
  const hasUpperCase = /[A-Z]/.test(form.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const isPasswordValid = hasMinLength && hasLowerCase && hasUpperCase && hasSpecialChar;

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

    const nameError = isTechnician ? null : validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordErrors = validatePassword(form.password);

    if (isTechnician && (!form.dni || !/^\d{8}$/.test(form.dni))) {
      setError('El DNI debe tener exactamente 8 digitos numericos.');
      setIsSubmitting(false);
      return;
    }

    if (nameError || emailError || passwordErrors.length > 0) {
      const messages = [nameError, emailError, ...passwordErrors].filter(Boolean);
      setError(messages.join('. '));
      setIsSubmitting(false);
      return;
    }

    try {
      if (isTechnician) {
        const techPayload = {
          name: sanitizeText(form.name) || 'Pendiente RENIEC',
          email: sanitizeText(form.email).toLowerCase(),
          password: form.password,
          dni: form.dni.trim(),
        };
        await registerTechnicianApi(techPayload);
        toast.success('Tecnico registrado. DNI verificado con RENIEC.');
      } else {
        const sanitizedForm = {
          name: sanitizeText(form.name),
          email: sanitizeText(form.email).toLowerCase(),
          password: form.password,
        };
        await register(sanitizedForm);
        toast.success('Cuenta creada');
      }
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
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated Network Background */}
      <NetworkBackground />

      {/* Register Card */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)',
          }}
        >
          {/* Header */}
          <motion.div
            className="flex flex-col items-center px-8 pt-10 pb-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo Icon */}
            <motion.div
              variants={itemVariants}
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-slate-950/20"
            >
              <Zap className="h-7 w-7 text-white" />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold tracking-tight text-slate-950"
            >
              Crear cuenta
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-2 text-center text-sm leading-relaxed text-slate-500"
            >
              Unete a la red de soporte tecnico mas inteligente
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.div
            className="px-8 pb-8 pt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants} className="mt-2">
                <ErrorMessage message={error} />
              </motion.div>

              {/* Role Selector */}
              <motion.div variants={itemVariants} className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de cuenta
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('CLIENTE')}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      !isTechnician
                        ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('TECNICO')}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isTechnician
                        ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Tecnico
                  </button>
                </div>
              </motion.div>

              {/* DNI Field (only for TECNICO) */}
              {isTechnician && (
                <motion.div
                  variants={itemVariants}
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-slate-700">
                    DNI (Documento Nacional de Identidad)
                  </label>
                  <div className="relative mt-2">
                    <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-slate-950/5"
                      name="dni"
                      placeholder="12345678"
                      maxLength={8}
                      value={form.dni}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setForm((prev) => ({ ...prev, dni: value }));
                      }}
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Se validara tu identidad con la RENIEC automaticamente
                  </p>
                </motion.div>
              )}

              {/* Name Field */}
              <motion.div variants={itemVariants} className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                  {isTechnician ? 'Nombre (se completara con datos RENIEC)' : 'Nombre completo'}
                </label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-slate-950/5 ${isTechnician ? 'bg-slate-50 text-slate-400' : ''}`}
                    name="name"
                    placeholder={isTechnician ? 'Se autocompletara con RENIEC' : 'Tu nombre'}
                    value={form.name}
                    onChange={handleChange}
                    required={!isTechnician}
                    disabled={isTechnician}
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants} className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                  Correo electronico
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-slate-950/5"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                  Contrasena
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className={`pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-slate-950/5 ${isSpaceAttempted ? '!border-red-500 bg-red-50 ring-2 ring-red-500/20' : ''}`}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {isSpaceAttempted && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-500"
                  >
                    No se permiten espacios en la contrasena.
                  </motion.p>
                )}

                {form.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 space-y-1.5 overflow-hidden"
                  >
                    {[
                      { check: hasMinLength, label: 'Minimo 8 caracteres' },
                      { check: hasLowerCase, label: 'Al menos una letra minuscula' },
                      { check: hasUpperCase, label: 'Al menos una letra mayuscula' },
                      { check: hasSpecialChar, label: 'Al menos un caracter especial' },
                    ].map(({ check, label }) => (
                      <motion.div
                        key={label}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                            check
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'border border-slate-300 bg-slate-50 text-slate-400'
                          }`}
                        >
                          {check ? '✓' : ''}
                        </div>
                        <span className={`text-xs transition-colors duration-300 ${check ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Role Badge */}
              <motion.div
                variants={itemVariants}
                className="mt-5 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200">
                  <span className="text-[10px]">👤</span>
                </div>
                <span className="text-xs text-slate-500">
                  {isTechnician ? (
                    <>
                      El registro creará una cuenta con rol <span className="font-semibold text-slate-700">TÉCNICO</span> (sujeta a verificación)
                    </>
                  ) : (
                    <>
                      El registro público crea cuentas con rol <span className="font-semibold text-slate-700">CLIENTE</span>
                    </>
                  )}
                </span>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="mt-6">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-950/25 disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={!isSubmitting && isPasswordValid ? { scale: 1.01 } : {}}
                  whileTap={!isSubmitting && isPasswordValid ? { scale: 0.98 } : {}}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ translateX: ['-100%', '200%'] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: 'easeInOut',
                    }}
                  />
                  <UserPlus className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">
                    {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Divider and Google Button or Info Alert */}
              {!isTechnician ? (
                <>
                  {/* Divider */}
                  <motion.div
                    variants={itemVariants}
                    className="my-6 flex items-center gap-3"
                  >
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">o</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </motion.div>

                  {/* Google Button */}
                  <motion.div variants={itemVariants} className="mt-2 mb-6 flex flex-col items-center gap-3">
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={(response) => handleGoogleAuthenticate(response.credential)}
                        onError={() => toast.error('Error al iniciar sesión con Google')}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="pill"
                        width="380"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGoogleModalOpen(true)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
                    >
                      ¿Problemas con Google? Usar simulador local
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="mt-6 mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center text-xs leading-relaxed text-blue-700 shadow-sm"
                >
                  <p className="font-semibold text-blue-800 mb-1">Registro con Google deshabilitado para técnicos</p>
                  Las cuentas de técnico requieren ingresar su DNI para la validación oficial con RENIEC. Por favor, complete el formulario superior.
                </motion.div>
              )}

              {/* Login Link */}
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-slate-500"
              >
                ¿Ya tienes cuenta?{' '}
                <Link
                  className="font-semibold text-slate-950 underline-offset-4 transition-colors hover:underline"
                  to={selectedRole === 'TECNICO' ? '/login?role=TECNICO' : '/login?role=CLIENTE'}
                >
                  Inicia sesión
                </Link>
              </motion.p>
            </form>
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="mx-auto mt-4 h-1 w-16 rounded-full bg-slate-950/10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 0.6, ease: 'easeOut' }}
        />
      </motion.div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onAuthenticate={handleMockGoogleAuthenticate}
      />
    </section>
  );
};
