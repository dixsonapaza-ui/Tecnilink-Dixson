import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Input } from '../components/ui/input.jsx';
import { NetworkBackground } from '../components/NetworkBackground.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiErrorMessage } from '../utils/api-error.js';
import { createSafeChangeHandler, sanitizeText } from '../utils/input-sanitizer.js';

/* ── animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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
export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpaceAttempted, setIsSpaceAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasMinLength = form.password.length >= 8;
  const hasLowerCase = /[a-z]/.test(form.password);
  const hasUpperCase = /[A-Z]/.test(form.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const isPasswordValid = hasMinLength && hasLowerCase && hasUpperCase && hasSpecialChar;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || '/dashboard';

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

    const sanitizedForm = {
      email: sanitizeText(form.email).toLowerCase(),
      password: form.password,
    };

    try {
      await login(sanitizedForm);
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
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated Network Background */}
      <NetworkBackground />

      {/* Login Card */}
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
              Tecnilink
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-2 text-center text-sm leading-relaxed text-slate-500"
            >
              Conecta con tecnicos especializados en minutos
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
              {location.state?.message && (
                <motion.div variants={itemVariants}>
                  <Alert variant="success">
                    {location.state.message}
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mt-2">
                <ErrorMessage message={error} />
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants} className="mt-5">
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

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="mt-7">
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
                  <LogIn className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">
                    {isSubmitting ? 'Ingresando...' : 'Entrar'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="my-6 flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">o</span>
                <div className="h-px flex-1 bg-slate-200" />
              </motion.div>

              {/* Register Link */}
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-slate-500"
              >
                No tienes cuenta?{' '}
                <Link
                  className="font-semibold text-slate-950 underline-offset-4 transition-colors hover:underline"
                  to="/register"
                >
                  Registrate
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
    </section>
  );
};
