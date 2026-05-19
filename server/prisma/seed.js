import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedPassword = 'Tecnilink123!';
const passwordSaltRounds = 10;

const main = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed is disabled when NODE_ENV=production.');
  }

  await prisma.requestComment.deleteMany();
  await prisma.technicalRequest.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash(seedPassword, passwordSaltRounds);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Tecnilink',
      email: 'admin@tecnilink.test',
      password,
      role: 'ADMIN',
    },
  });

  const [technicianOne, technicianTwo] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Carlos Ramos',
        email: 'carlos.tecnico@tecnilink.test',
        password,
        role: 'TECNICO',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mariana Flores',
        email: 'mariana.tecnico@tecnilink.test',
        password,
        role: 'TECNICO',
      },
    }),
  ]);

  const [clientOne, clientTwo, clientThree] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Luis Herrera',
        email: 'luis.cliente@tecnilink.test',
        password,
        role: 'CLIENTE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Torres',
        email: 'ana.cliente@tecnilink.test',
        password,
        role: 'CLIENTE',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Diego Salazar',
        email: 'diego.cliente@tecnilink.test',
        password,
        role: 'CLIENTE',
      },
    }),
  ]);

  const [hardware, software, network, accounts] = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: 'Hardware',
        description: 'Revision de equipos, perifericos y componentes fisicos.',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Software',
        description: 'Instalacion, configuracion y errores de aplicaciones.',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Redes',
        description: 'Conectividad, internet, cableado y acceso a red.',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Cuentas y accesos',
        description: 'Credenciales, permisos y recuperacion de acceso.',
      },
    }),
  ]);

  const requests = await Promise.all([
    prisma.technicalRequest.create({
      data: {
        title: 'Laptop no enciende',
        description: 'El equipo no responde al presionar el boton de encendido.',
        priority: 'ALTA',
        status: 'PENDIENTE',
        clientId: clientOne.id,
        categoryId: hardware.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Instalacion de software contable',
        description: 'Se requiere instalar el sistema contable en una nueva estacion.',
        priority: 'MEDIA',
        status: 'EN_PROCESO',
        clientId: clientTwo.id,
        technicianId: technicianOne.id,
        categoryId: software.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Conexion WiFi intermitente',
        description: 'La conexion se pierde varias veces durante la jornada.',
        priority: 'MEDIA',
        status: 'EN_PROCESO',
        clientId: clientThree.id,
        technicianId: technicianTwo.id,
        categoryId: network.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Recuperacion de cuenta',
        description: 'El usuario no puede ingresar al sistema interno.',
        priority: 'ALTA',
        status: 'ATENDIDA',
        clientId: clientOne.id,
        technicianId: technicianOne.id,
        categoryId: accounts.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Impresora sin toner',
        description: 'La impresora del area administrativa solicita reemplazo de toner.',
        priority: 'BAJA',
        status: 'PENDIENTE',
        clientId: clientTwo.id,
        categoryId: hardware.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Error al abrir hoja de calculo',
        description: 'El archivo principal muestra error al abrir en la aplicacion.',
        priority: 'MEDIA',
        status: 'PENDIENTE',
        clientId: clientThree.id,
        categoryId: software.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Cable de red danado',
        description: 'El punto de red del escritorio 12 no tiene enlace.',
        priority: 'BAJA',
        status: 'ATENDIDA',
        clientId: clientOne.id,
        technicianId: technicianTwo.id,
        categoryId: network.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Cambio de permisos',
        description: 'Se requiere acceso de lectura a reportes compartidos.',
        priority: 'MEDIA',
        status: 'CANCELADA',
        clientId: clientTwo.id,
        categoryId: accounts.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Actualizacion de antivirus',
        description: 'El equipo muestra alerta de definiciones desactualizadas.',
        priority: 'BAJA',
        status: 'EN_PROCESO',
        clientId: clientThree.id,
        technicianId: technicianOne.id,
        categoryId: software.id,
      },
    }),
    prisma.technicalRequest.create({
      data: {
        title: 'Monitor sin imagen',
        description: 'El monitor externo no detecta senal desde la laptop.',
        priority: 'ALTA',
        status: 'PENDIENTE',
        clientId: clientOne.id,
        categoryId: hardware.id,
      },
    }),
  ]);

  await prisma.requestComment.createMany({
    data: [
      {
        content: 'Solicitud recibida y pendiente de diagnostico inicial.',
        requestId: requests[0].id,
        authorId: admin.id,
      },
      {
        content: 'Se inicio instalacion y validacion de licencia.',
        requestId: requests[1].id,
        authorId: technicianOne.id,
      },
      {
        content: 'Se verificara cobertura del punto de acceso mas cercano.',
        requestId: requests[2].id,
        authorId: technicianTwo.id,
      },
      {
        content: 'Cuenta recuperada y credenciales entregadas al usuario.',
        requestId: requests[3].id,
        authorId: technicianOne.id,
      },
      {
        content: 'El punto fue reemplazado y quedo operativo.',
        requestId: requests[6].id,
        authorId: technicianTwo.id,
      },
      {
        content: 'La solicitud fue cancelada por el cliente antes de la asignacion.',
        requestId: requests[7].id,
        authorId: clientTwo.id,
      },
    ],
  });

  console.log('Seed completed.');
  console.log(`Default password for seed users: ${seedPassword}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
