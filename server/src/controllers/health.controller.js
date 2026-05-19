import { getHealthStatus } from '../services/health.service.js';

export const getHealth = async (_req, res) => {
  const healthStatus = await getHealthStatus();

  res.status(200).json(healthStatus);
};
