import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { validateDni } from './reniec.service.js';

export const publicProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  phone: true,
  bio: true,
  specialty: true,
  experienceYears: true,
  serviceArea: true,
  dni: true,
  dniVerified: true,
  dniVerifiedAt: true,
  reniecCodigoVerificacion: true,
  reniecNombres: true,
  reniecApellidoPaterno: true,
  reniecApellidoMaterno: true,
  reniecNombreCompleto: true,
  reniecDepartamento: true,
  reniecProvincia: true,
  reniecDistrito: true,
  reniecDireccion: true,
  reniecDireccionCompleta: true,
  reniecUbigeoReniec: true,
  reniecUbigeoSunat: true,
  reniecUbigeo: true,
  createdAt: true,
  updatedAt: true,
};

export const getProfileById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  // Automatic backfill/healing for existing users registered before the RENIEC fields update
  if (user.role === 'TECNICO' && user.dni && user.dniVerified && !user.reniecNombreCompleto) {
    try {
      const reniecData = await validateDni(user.dni);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: reniecData,
        select: publicProfileSelect,
      });
      return updatedUser;
    } catch (err) {
      console.error('[Profile Backfill Error] Failed to heal RENIEC data:', err);
    }
  }

  return user;
};

export const updateProfileById = async (userId, userRole, data) => {
  let updateData = {};

  if (userRole === 'TECNICO') {
    // Technicians cannot edit 'name' as it's official RENIEC data.
    const { phone, bio, specialty, experienceYears, serviceArea } = data;
    
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
    if (bio !== undefined) updateData.bio = bio ? String(bio).trim() : null;
    if (specialty !== undefined) updateData.specialty = specialty ? String(specialty).trim() : null;
    if (experienceYears !== undefined) {
      updateData.experienceYears = experienceYears !== null && experienceYears !== '' ? Number(experienceYears) : null;
    }
    if (serviceArea !== undefined) updateData.serviceArea = serviceArea ? String(serviceArea).trim() : null;
  } else {
    // CLIENTE, ADMIN, SUPER_ADMIN
    const { name, phone, bio } = data;
    
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName || trimmedName.length < 2) {
        throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
      }
      updateData.name = trimmedName;
    }
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
    if (bio !== undefined) updateData.bio = bio ? String(bio).trim() : null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: publicProfileSelect,
  });

  return updatedUser;
};

export const updateAvatarUrl = async (userId, avatarUrl) => {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: publicProfileSelect,
  });
};
