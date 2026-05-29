import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Logs an audit action into the database.
 * This is a "fire-and-forget" function and should not throw errors to block the main thread.
 *
 * @param {string} action - The action performed (e.g. "LOGIN", "CREATE_REQUEST").
 * @param {string|object} details - The details of the action. If object, it will be stringified.
 * @param {string|null} userId - The ID of the user performing the action.
 */
export const logAuditAction = async (action, details, userId = null) => {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    
    await prisma.auditLog.create({
      data: {
        action,
        details: detailsStr,
        userId,
      },
    });
  } catch (error) {
    // We only log this to console to avoid crashing the main requests
    console.error(`Failed to create audit log for action: ${action}`, error);
  }
};
