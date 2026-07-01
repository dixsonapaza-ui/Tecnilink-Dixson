import { useEffect, useState } from 'react';
import { Shield, Save, RefreshCw, CheckCircle2, Sliders, Users } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '../components/PageHeader.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { getSettings, updateSettings } from '../services/api.js';
import { getApiErrorMessage } from '../utils/api-error.js';

export const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getSettings();
      setSettings(response.settings);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'No se pudieron cargar los ajustes del sistema.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateSettings({
        assignmentMode: settings.assignmentMode,
        maxActiveJobs: Number(settings.maxActiveJobs),
      });
      toast.success(response.message || 'Configuración guardada correctamente.');
      setSettings(response.settings);
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError, 'No se pudo actualizar la configuración.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando configuración del sistema..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        description="Gestiona las reglas de negocio, estrategias de asignación y políticas de cherry-picking para tu empresa."
      />

      <ErrorMessage message={error} />

      <form onSubmit={handleSave} className="max-w-3xl">
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Sliders className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle className="text-xl">Modo de Asignación de Solicitudes</CardTitle>
                <CardDescription>Elige cómo se distribuirán los nuevos tickets técnicos.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Mode Selector Radio Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* MANUAL CARD */}
              <label
                className={`relative flex cursor-pointer flex-col rounded-lg border-2 p-4 outline-none transition-all ${
                  settings.assignmentMode === 'MANUAL'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="assignmentMode"
                  value="MANUAL"
                  checked={settings.assignmentMode === 'MANUAL'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Manual</span>
                  <span className="mt-1 text-xs text-slate-600">
                    El administrador asigna manualmente cada solicitud a un técnico.
                  </span>
                </span>
                {settings.assignmentMode === 'MANUAL' && (
                  <CheckCircle2 className="absolute top-4 right-4 h-4 w-4 text-indigo-600" />
                )}
              </label>

              {/* SELF_ASSIGNMENT CARD */}
              <label
                className={`relative flex cursor-pointer flex-col rounded-lg border-2 p-4 outline-none transition-all ${
                  settings.assignmentMode === 'SELF_ASSIGNMENT'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="assignmentMode"
                  value="SELF_ASSIGNMENT"
                  checked={settings.assignmentMode === 'SELF_ASSIGNMENT'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Autoasignación</span>
                  <span className="mt-1 text-xs text-slate-600">
                    Bolsa de trabajo. Los técnicos compatibles ven y aceptan trabajos.
                  </span>
                </span>
                {settings.assignmentMode === 'SELF_ASSIGNMENT' && (
                  <CheckCircle2 className="absolute top-4 right-4 h-4 w-4 text-indigo-600" />
                )}
              </label>

              {/* AUTO CARD */}
              <label
                className={`relative flex cursor-pointer flex-col rounded-lg border-2 p-4 outline-none transition-all ${
                  settings.assignmentMode === 'AUTO'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="assignmentMode"
                  value="AUTO"
                  checked={settings.assignmentMode === 'AUTO'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Inteligente (Auto)</span>
                  <span className="mt-1 text-xs text-slate-600">
                    El sistema asigna automáticamente al técnico con menor carga de trabajo.
                  </span>
                </span>
                {settings.assignmentMode === 'AUTO' && (
                  <CheckCircle2 className="absolute top-4 right-4 h-4 w-4 text-indigo-600" />
                )}
              </label>
            </div>

            {/* Anti-Cherry Picking section */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-md font-semibold text-slate-900">Reglas Anti-Cherry Picking</h3>
                  <p className="text-xs text-slate-600">Controla la capacidad máxima de trabajo simultáneo.</p>
                </div>
              </div>

              <div className="max-w-xs space-y-2">
                <label htmlFor="maxActiveJobs" className="block text-sm font-semibold text-slate-700">
                  Límite de trabajos activos por técnico
                </label>
                <select
                  id="maxActiveJobs"
                  name="maxActiveJobs"
                  value={settings.maxActiveJobs}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="1">1 Trabajo activo</option>
                  <option value="2">2 Trabajos activos</option>
                  <option value="3">3 Trabajos activos (Recomendado)</option>
                  <option value="4">4 Trabajos activos</option>
                  <option value="5">5 Trabajos activos</option>
                  <option value="10">10 Trabajos activos</option>
                </select>
                <p className="text-xs text-slate-500">
                  Los técnicos no podrán aceptar solicitudes de la bolsa de trabajo si ya han alcanzado este límite.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 dark:bg-slate-900/10 dark:border-slate-800">
            <Button
              type="submit"
              disabled={isSaving}
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
