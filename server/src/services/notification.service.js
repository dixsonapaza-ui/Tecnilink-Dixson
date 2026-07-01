import { prisma } from '../config/prisma.js';

export const createNotification = async (userId, title, message) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

export const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const markNotificationsAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
