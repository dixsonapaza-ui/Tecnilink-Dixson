import { getUserNotifications, markNotificationsAsRead } from '../services/notification.service.js';

export const indexNotifications = async (req, res) => {
  const notifications = await getUserNotifications(req.user.id);
  res.status(200).json({
    success: true,
    notifications,
  });
};

export const readNotifications = async (req, res) => {
  await markNotificationsAsRead(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Notificaciones marcadas como leídas',
  });
};
