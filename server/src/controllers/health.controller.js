import { getHealthStatus } from '../services/health.service.js';

export const getHealth = async (req, res) => {
  const quick = req.query.quick === 'true';
  const healthStatus = await getHealthStatus(quick);

  res.status(200).json(healthStatus);
};
