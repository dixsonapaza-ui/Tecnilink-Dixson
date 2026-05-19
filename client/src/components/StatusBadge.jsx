import { Badge } from './ui/badge.jsx';

const variantByValue = {
  PENDIENTE: 'pending',
  EN_PROCESO: 'progress',
  ATENDIDA: 'done',
  CANCELADA: 'canceled',
  ALTA: 'high',
  MEDIA: 'medium',
  BAJA: 'low',
};

export const StatusBadge = ({ value }) => <Badge variant={variantByValue[value] || 'outline'}>{value}</Badge>;
