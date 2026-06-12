import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Briefcase, MapPin, Calendar, Award, Shield, CheckCircle, Edit, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfileMe } from '../services/api.js';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileMe();
        setProfile(data.user);
        // Sync context user
        updateUser(data.user);
      } catch (error) {
        toast.error('No se pudo cargar la informacion actualizada del perfil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U';

  const roleLabels = {
    CLIENTE: 'Cliente',
    TECNICO: 'Tecnico verificado',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
  };

  const isTech = profile?.role === 'TECNICO';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-8 pb-12"
    >
      {/* Header card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-slate-50"></div>
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Avatar */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-3xl font-bold text-white shadow-lg md:h-28 md:w-28">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{profile?.name}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : isTech
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {roleLabels[profile?.role] || profile?.role}
              </span>
              {profile?.isActive && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Activo
                </span>
              )}
            </div>
            <p className="mt-2 text-slate-500">{profile?.email}</p>
            {profile?.bio ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">{profile.bio}</p>
            ) : (
              <p className="mt-4 text-sm italic text-slate-400">Sin biografia redactada</p>
            )}
          </div>

          {/* Edit action */}
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <Edit className="h-4 w-4" />
            Editar perfil
          </button>
        </div>
      </motion.div>

      {/* Info grids */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <User className="h-5 w-5 text-slate-700" />
            Informacion de contacto
          </h2>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-500">Correo electronico</p>
                <p className="text-slate-800">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-500">Telefono</p>
                <p className="text-slate-800">{profile?.phone || 'No especificado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-500">Miembro desde</p>
                <p className="text-slate-800">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional details for technicians */}
        {isTech && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Briefcase className="h-5 w-5 text-slate-700" />
              Informacion Profesional
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Award className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-500">Especialidad</p>
                  <p className="text-slate-800 font-semibold">{profile?.specialty || 'No especificada'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-500">Anos de experiencia</p>
                  <p className="text-slate-800">
                    {profile?.experienceYears !== null && profile?.experienceYears !== undefined
                      ? `${profile.experienceYears} ano(s)`
                      : 'No especificados'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-500">Zona de cobertura / atencion</p>
                  <p className="text-slate-800">{profile?.serviceArea || 'No especificada'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Verified RENIEC details for technicians */}
      {isTech && profile?.dniVerified && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <Shield className="h-5 w-5 text-emerald-600" />
              Datos Verificados con RENIEC
            </h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" /> Identidad Validada
            </span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="font-semibold text-slate-500">DNI</p>
              <p className="mt-0.5 text-slate-850 font-medium">{profile?.dni}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Codigo de verificacion</p>
              <p className="mt-0.5 text-slate-850">{profile?.reniecCodigoVerificacion}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Nombre completo oficial</p>
              <p className="mt-0.5 text-slate-850 font-medium">{profile?.reniecNombreCompleto}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500 font-semibold">Departamento</p>
              <p className="mt-0.5 text-slate-850">{profile?.reniecDepartamento}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Provincia</p>
              <p className="mt-0.5 text-slate-850">{profile?.reniecProvincia}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Distrito</p>
              <p className="mt-0.5 text-slate-850">{profile?.reniecDistrito}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-semibold text-slate-500">Direccion completa de ficha DNI</p>
              <p className="mt-0.5 text-slate-850">{profile?.reniecDireccionCompleta}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Fecha de validacion</p>
              <p className="mt-0.5 text-slate-850">
                {profile?.dniVerifiedAt
                  ? new Date(profile.dniVerifiedAt).toLocaleString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
