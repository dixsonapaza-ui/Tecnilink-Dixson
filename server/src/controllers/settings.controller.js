import { getCompanySettings, updateCompanySettings } from '../services/settings.service.js';

export const getSettings = async (req, res) => {
  const settings = await getCompanySettings();
  res.status(200).json({
    success: true,
    settings,
  });
};

export const updateSettings = async (req, res) => {
  const settings = await updateCompanySettings(req.body);
  res.status(200).json({
    success: true,
    message: 'Configuración actualizada correctamente',
    settings,
  });
};
