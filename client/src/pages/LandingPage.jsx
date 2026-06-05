import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { buttonVariants } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { NetworkBackground } from '../components/NetworkBackground.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getHealthStatus } from '../services/api.js';

/* ── animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const LandingPage = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getHealthStatus();
        setHealth(data);
      } catch {
        setError('No se pudo conectar con la API. Verifica que el backend este ejecutandose.');
      }
    };

    loadHealth();
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-73px)] flex items-center justify-center py-12 px-6">
      {/* Background Effect */}
      <NetworkBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div 
          className="flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="border-slate-300 bg-white/50 backdrop-blur-sm text-slate-800">
              Soporte tecnico academico
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants} 
            className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl"
          >
            Tecnilink
          </motion.h1>
          
          <motion.p 
            variants={itemVariants} 
            className="mt-5 max-w-2xl text-lg leading-8 text-slate-600"
          >
            Gestiona solicitudes tecnicas con roles, seguimiento de estados y una base lista para pruebas academicas.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={`${buttonVariants({ size: 'lg' })} relative overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-950/10`}
              >
                Ir al Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${buttonVariants({ size: 'lg' })} relative overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-950/10`}
                >
                  Iniciar sesion
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className={`${buttonVariants({ variant: 'outline', size: 'lg' })} bg-white/85 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] border-slate-300 hover:bg-slate-50`}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['Roles claros', ShieldCheck],
              ['Flujo trazable', Workflow],
              ['API conectada', CheckCircle2],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-600 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg p-2.5 shadow-sm">
                <Icon className="h-4 w-4 text-slate-950" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center"
        >
          <Card 
            className="w-full border border-slate-200/80 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)',
            }}
          >
            <CardHeader>
              <CardTitle className="text-slate-900 font-semibold">Estado del backend</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorMessage message={error} />
              {!health && !error && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Consultando API...
                </div>
              )}
              {health && (
                <dl className="grid gap-4 text-sm">
                  <div className="bg-white/60 p-3 rounded-lg border border-slate-100">
                    <dt className="font-medium text-slate-400 text-xs uppercase tracking-wider">Status</dt>
                    <dd className="mt-1 text-emerald-600 font-semibold flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      {health.status}
                    </dd>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-slate-100">
                    <dt className="font-medium text-slate-400 text-xs uppercase tracking-wider">Message</dt>
                    <dd className="mt-1 text-slate-800 font-medium">{health.message}</dd>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-slate-100">
                    <dt className="font-medium text-slate-400 text-xs uppercase tracking-wider">Environment</dt>
                    <dd className="mt-1 text-slate-800 font-medium capitalize">{health.environment}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
