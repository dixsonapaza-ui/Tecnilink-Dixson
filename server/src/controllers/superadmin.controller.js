import {
  createAdmin,
  deactivateAdmin,
  getGlobalMetrics,
  listAdmins,
  listAuditLogs,
} from '../services/superadmin.service.js';

export const getMetrics = async (req, res) => {
  const metrics = await getGlobalMetrics();
  res.status(200).json(metrics);
};

export const indexAdmins = async (req, res) => {
  const admins = await listAdmins();
  res.status(200).json(admins);
};

export const storeAdmin = async (req, res) => {
  const admin = await createAdmin(req.body);
  res.status(201).json({
    message: 'Administrador creado correctamente',
    admin,
  });
};

export const toggleAdminStatus = async (req, res) => {
  const admin = await deactivateAdmin(req.params.id);
  res.status(200).json({
    message: `Administrador ${admin.isActive ? 'activado' : 'desactivado'} correctamente`,
    admin,
  });
};

export const indexAuditLogs = async (req, res) => {
  const result = await listAuditLogs(req.query);
  res.status(200).json(result);
};
