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

  const validatePhone = (phone) => {
    if (phone) {
      const cleanPhone = String(phone).trim();
      const phoneRegex = /^\+?[0-9\s\-]{9,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        throw new AppError('El telefono debe tener entre 9 y 15 digitos (se permiten espacios, guiones y + al inicio).', 400);
      }
      return cleanPhone;
    }
    return null;
  };

  const validateBio = (bio) => {
    if (bio) {
      const cleanBio = String(bio).trim();
      if (cleanBio.length > 500) {
        throw new AppError('La biografia no debe superar los 500 caracteres.', 400);
      }
      return cleanBio;
    }
    return null;
  };

  if (userRole === 'TECNICO') {
    // Technicians cannot edit 'name' as it's official RENIEC data.
    const { phone, bio, specialty, experienceYears, serviceArea } = data;
    
    if (phone !== undefined) updateData.phone = validatePhone(phone);
    if (bio !== undefined) updateData.bio = validateBio(bio);
    if (specialty !== undefined) {
      const cleanSpecialty = specialty ? String(specialty).trim() : '';
      if (cleanSpecialty.length > 100) {
        throw new AppError('La especialidad no debe superar los 100 caracteres.', 400);
      }
      updateData.specialty = cleanSpecialty || null;
    }
    if (experienceYears !== undefined) {
      if (experienceYears !== null && experienceYears !== '') {
        const years = Number(experienceYears);
        if (isNaN(years) || years < 0 || years > 50) {
          throw new AppError('Los anos de experiencia deben estar entre 0 y 50.', 400);
        }
        updateData.experienceYears = years;
      } else {
        updateData.experienceYears = null;
      }
    }
    if (serviceArea !== undefined) {
      const cleanArea = serviceArea ? String(serviceArea).trim() : '';
      if (cleanArea.length > 150) {
        throw new AppError('La zona de cobertura no debe superar los 150 caracteres.', 400);
      }
      updateData.serviceArea = cleanArea || null;
    }
  } else {
    // CLIENTE, ADMIN, SUPER_ADMIN
    const { name, phone, bio } = data;
    
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName || trimmedName.length < 2) {
        throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
      }
      if (trimmedName.length > 100) {
        throw new AppError('El nombre no debe superar los 100 caracteres.', 400);
      }
      updateData.name = trimmedName;
    }
    if (phone !== undefined) updateData.phone = validatePhone(phone);
    if (bio !== undefined) updateData.bio = validateBio(bio);
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
