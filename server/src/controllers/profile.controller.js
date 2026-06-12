import { getProfileById, updateProfileById, updateAvatarUrl } from '../services/profile.service.js';
import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/app-error.js';
import { logAuditAction } from '../services/audit.service.js';

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tecnilink-avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

export const getProfile = async (req, res) => {
  const profile = await getProfileById(req.user.id);
  res.status(200).json({
    success: true,
    user: profile,
  });
};

export const updateProfile = async (req, res) => {
  const updatedProfile = await updateProfileById(req.user.id, req.user.role, req.body);
  
  logAuditAction('PROFILE_UPDATE', `User ${req.user.email} updated profile details`, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Perfil actualizado correctamente',
    user: updatedProfile,
  });
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    throw new AppError('No se subio ninguna imagen', 400);
  }

  try {
    const secureUrl = await uploadToCloudinary(req.file.buffer);
    const updatedProfile = await updateAvatarUrl(req.user.id, secureUrl);
    
    logAuditAction('AVATAR_UPDATE', `User ${req.user.email} updated avatar`, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      data: {
        avatarUrl: secureUrl,
      },
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Error en uploadAvatar:', error);
    throw new AppError('Error al procesar y subir la imagen a Cloudinary', 500);
  }
};
