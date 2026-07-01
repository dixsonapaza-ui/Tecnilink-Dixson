import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Save, X, Phone, User, Briefcase, MapPin, Award, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfileMe, uploadAvatar } from '../services/api.js';
import { Input } from '../components/ui/input.jsx';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../utils/api-error.js';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const ProfileEditPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    experienceYears: user?.experienceYears !== null && user?.experienceYears !== undefined ? String(user.experienceYears) : '',
    serviceArea: user?.serviceArea || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const isTech = user?.role === 'TECNICO';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    // Allow numbers, spaces, hyphens, and a single leading '+'
    const sanitized = value.replace(/[^\d\s\-+]/g, '');
    let finalValue = sanitized;
    if (sanitized.includes('+')) {
      finalValue = (sanitized.startsWith('+') ? '+' : '') + sanitized.replace(/\+/g, '');
    }
    setForm((prev) => ({ ...prev, phone: finalValue }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo se aceptan imagenes png, jpeg, jpg o webp.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB de tamano.');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const res = await uploadAvatar(formData);
      updateUser(res.user);
      toast.success('Foto de perfil actualizada correctamente');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'No se pudo subir la foto de perfil.');
      toast.error(msg);
      // Reset preview to original on error
      setAvatarPreview(user?.avatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validations
    if (form.phone) {
      const cleanPhone = form.phone.trim();
      const phoneRegex = /^\+?[0-9\s\-]{9,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError('El telefono debe tener entre 9 y 15 digitos (se permiten espacios, guiones y el simbolo + al inicio).');
        toast.error('Numero de telefono invalido');
        return;
      }
    }

    if (form.bio && form.bio.trim().length > 500) {
      setError('La biografia no debe superar los 500 caracteres.');
      toast.error('Biografia demasiado larga');
      return;
    }

    if (isTech) {
      if (form.specialty && form.specialty.trim().length > 100) {
        setError('La especialidad no debe superar los 100 caracteres.');
        toast.error('Especialidad demasiado larga');
        return;
      }

      if (form.experienceYears !== '') {
        const years = Number(form.experienceYears);
        if (isNaN(years) || years < 0 || years > 50) {
          setError('Los anos de experiencia deben estar entre 0 y 50.');
          toast.error('Anos de experiencia invalidos');
          return;
        }
      }

      if (form.serviceArea && form.serviceArea.trim().length > 150) {
        setError('La zona de cobertura no debe superar los 150 caracteres.');
        toast.error('Zona de cobertura demasiado larga');
        return;
      }
    } else {
      if (!form.name || form.name.trim().length < 2) {
        setError('El nombre debe tener al menos 2 caracteres.');
        toast.error('Nombre demasiado corto');
        return;
      }
      if (form.name.trim().length > 100) {
        setError('El nombre no debe superar los 100 caracteres.');
        toast.error('Nombre demasiado largo');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = isTech
        ? {
            phone: form.phone ? form.phone.trim() : null,
            bio: form.bio ? form.bio.trim() : null,
            specialty: form.specialty ? form.specialty.trim() : null,
            experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
            serviceArea: form.serviceArea ? form.serviceArea.trim() : null,
          }
        : {
            name: form.name.trim(),
            phone: form.phone ? form.phone.trim() : null,
            bio: form.bio ? form.bio.trim() : null,
          };

      const res = await updateProfileMe(payload);
      updateUser(res.user);
      toast.success('Perfil actualizado con exito');
      navigate('/profile');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'No se pudo actualizar el perfil.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-8 pb-12"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-950">Editar Perfil</h1>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4" /> Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Foto de perfil</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-24 w-24 shrink-0 rounded-2xl bg-slate-900 text-3xl font-bold text-white shadow-md flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Vista previa avatar"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" /> Seleccionar imagen
              </button>
              <p className="mt-2 text-xs text-slate-400">
                Formatos permitidos: PNG, JPG, JPEG o WEBP. Tamano maximo: 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
            Informacion del Perfil
          </h2>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name - clients/admins only */}
            {!isTech ? (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="pl-10 focus:ring-2 focus:ring-slate-950/5"
                    required
                  />
                </div>
              </div>
            ) : (
              // Name - disabled for tech
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-400">Nombre completo</label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-450" />
                  <Input
                    value={user?.name}
                    className="pl-10 bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
                    disabled
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Datos validados por RENIEC. No se pueden editar manualmente.
                </p>
              </div>
            )}

            {/* Phone */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">Telefono de contacto</label>
                <span className="text-xs text-slate-400">{(form.phone || '').length} / 15</span>
              </div>
              <div className="relative mt-2">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="Ej: +51 987654321"
                  maxLength={15}
                  className="pl-10 focus:ring-2 focus:ring-slate-950/5"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">Biografia / Presentacion</label>
                <span className="text-xs text-slate-400">{(form.bio || '').length} / 500</span>
              </div>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Cuenta brevemente sobre ti..."
                maxLength={500}
                rows={4}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder-slate-400 shadow-sm focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/5"
              />
            </div>

            {/* Technical professional fields */}
            {isTech && (
              <>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Especialidad</label>
                    <span className="text-xs text-slate-400">{(form.specialty || '').length} / 100</span>
                  </div>
                  <div className="relative mt-2">
                    <Award className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      name="specialty"
                      value={form.specialty}
                      onChange={handleChange}
                      placeholder="Ej: Lavadoras, Electronica"
                      maxLength={100}
                      className="pl-10 focus:ring-2 focus:ring-slate-950/5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Anos de experiencia</label>
                  <div className="relative mt-2">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      name="experienceYears"
                      value={form.experienceYears}
                      onChange={handleChange}
                      placeholder="Ej: 5"
                      min={0}
                      max={50}
                      className="pl-10 focus:ring-2 focus:ring-slate-950/5"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Zona de atencion / cobertura</label>
                    <span className="text-xs text-slate-400">{(form.serviceArea || '').length} / 150</span>
                  </div>
                  <div className="relative mt-2">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      name="serviceArea"
                      value={form.serviceArea}
                      onChange={handleChange}
                      placeholder="Ej: Arequipa Metropolitana, Yanahuara"
                      maxLength={150}
                      className="pl-10 focus:ring-2 focus:ring-slate-950/5"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Read-only RENIEC details for Technicians */}
        {isTech && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-500">
              <Lock className="h-4.5 w-4.5 text-slate-400" />
              Datos RENIEC de Solo Lectura
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3 text-sm text-slate-600">
              <ShieldAlert className="h-5 w-5 text-slate-450 shrink-0 mt-0.5" />
              <span>Los siguientes campos estan validados oficialmente con la base de datos de la RENIEC y no pueden ser alterados.</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <label className="font-semibold text-slate-500">DNI</label>
                <Input value={user?.dni || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-500">Codigo de verificacion</label>
                <Input value={user?.reniecCodigoVerificacion || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-500">Nombre completo oficial</label>
                <Input value={user?.reniecNombreCompleto || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-500">Departamento</label>
                <Input value={user?.reniecDepartamento || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-500">Provincia</label>
                <Input value={user?.reniecProvincia || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
              <div>
                <label className="font-semibold text-slate-500">Distrito</label>
                <Input value={user?.reniecDistrito || ''} className="mt-2 bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200" disabled />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-900 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
