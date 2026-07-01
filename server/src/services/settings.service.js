import { prisma } from '../config/prisma.js';

export const getCompanySettings = async () => {
  // Try to find the first settings row
  let settings = await prisma.companySettings.findFirst();
  
  // Lazy-initialization / Seeding if none exist
  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        assignmentMode: 'MANUAL',
        maxActiveJobs: 3,
      },
    });
  }
  
  return settings;
};

export const updateCompanySettings = async (data) => {
  const settings = await getCompanySettings();
  
  return prisma.companySettings.update({
    where: { id: settings.id },
    data: {
      assignmentMode: data.assignmentMode !== undefined ? data.assignmentMode : settings.assignmentMode,
      maxActiveJobs: data.maxActiveJobs !== undefined ? Number(data.maxActiveJobs) : settings.maxActiveJobs,
    },
  });
};
