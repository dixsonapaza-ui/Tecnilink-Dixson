import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const GoogleAuthModal = ({ isOpen, onClose, onAuthenticate }) => {
  const [loadingAccount, setLoadingAccount] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', email: '' });

  const seedAccounts = [
    { name: 'Luis Cliente', email: 'luis.cliente@tecnilink.test', initial: 'LC', bg: 'bg-blue-600' },
    { name: 'Ana Cliente', email: 'ana.cliente@tecnilink.test', initial: 'AC', bg: 'bg-green-600' },
  ];

  const handleSelectAccount = async (account) => {
    setLoadingAccount(account.email);
    try {
      // Simulate delay for OAuth communication
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onAuthenticate({ name: account.name, email: account.email });
      toast.success(`Conectado como ${account.name}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al autenticar con Google');
    } finally {
      setLoadingAccount(null);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customForm.name || !customForm.email) return;

    setLoadingAccount('custom');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onAuthenticate({ name: customForm.name, email: customForm.email });
      toast.success(`Cuenta Google creada para ${customForm.name}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al autenticar con Google');
    } finally {
      setLoadingAccount(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-lg bg-white p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          {/* Google Header */}
          <div className="flex flex-col items-center text-center">
            <GoogleLogo />
            <h2 className="mt-4 text-2xl font-normal text-slate-900">
              {showCustomForm ? 'Crear cuenta con Google' : 'Elige una cuenta'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              para continuar en <span className="font-medium text-slate-800">Tecnilink</span>
            </p>
          </div>

          <div className="mt-8 min-h-[220px]">
            {loadingAccount ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="mt-4 text-sm text-slate-500">Iniciando sesión de forma segura...</p>
              </div>
            ) : showCustomForm ? (
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 cursor-pointer text-sm font-medium hover:underline mb-2" onClick={() => setShowCustomForm(false)}>
                  <ArrowLeft className="h-4 w-4" /> Volver a cuentas
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej. Juan Pérez"
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="ejemplo@gmail.com"
                      value={customForm.email}
                      onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 mt-2"
                >
                  Siguiente
                </button>
              </form>
            ) : (
              <div className="space-y-1 border-t border-b border-slate-100 py-2">
                {seedAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSelectAccount(account)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${account.bg} font-semibold text-white text-xs`}>
                      {account.initial}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-slate-800">{account.name}</p>
                      <p className="truncate text-xs text-slate-500">{account.email}</p>
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Usar otra cuenta</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <span>Español (América Latina)</span>
            <div className="flex gap-3">
              <a href="#" className="hover:underline">Ayuda</a>
              <a href="#" className="hover:underline">Privacidad</a>
              <a href="#" className="hover:underline">Condiciones</a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
