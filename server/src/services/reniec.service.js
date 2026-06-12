import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const DNI_REGEX = /^\d{8}$/;

/**
 * Validates a DNI number against the RENIEC/Factiliza API.
 * Only returns safe, non-sensitive data to the caller.
 *
 * @param {string} dni - The 8-digit DNI number to validate.
 * @returns {Promise<{dni: string, nombres: string, apellidoPaterno: string, apellidoMaterno: string, nombreCompleto: string}>}
 */
export const validateDni = async (dni) => {
  if (!dni || !DNI_REGEX.test(dni)) {
    throw new AppError('El DNI debe tener exactamente 8 digitos numericos', 400);
  }

  let response;
  try {
    response = await fetch(`${env.reniecApiBaseUrl}/${dni}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.reniecApiToken}`,
      },
    });
  } catch (error) {
    console.error('Error al conectar con la API de RENIEC:', error);
    throw new AppError('No se pudo conectar con el servicio de validacion de DNI', 503);
  }

  if (!response.ok) {
    throw new AppError('El DNI ingresado no existe o no pudo ser validado', 400);
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    console.error('Error al parsear respuesta de RENIEC:', error);
    throw new AppError('El DNI ingresado no existe o no pudo ser validado', 400);
  }

  if (!body.success || body.status !== 200 || !body.data) {
    throw new AppError('El DNI ingresado no existe o no pudo ser validado', 400);
  }

  const {
    numero,
    codigo_verificacion,
    nombres,
    apellido_paterno,
    apellido_materno,
    nombre_completo,
    departamento,
    provincia,
    distrito,
    direccion,
    direccion_completa,
    ubigeo_reniec,
    ubigeo_sunat,
    ubigeo,
  } = body.data;

  return {
    dni: numero,
    reniecCodigoVerificacion: codigo_verificacion || null,
    reniecNombres: nombres || null,
    reniecApellidoPaterno: apellido_paterno || null,
    reniecApellidoMaterno: apellido_materno || null,
    reniecNombreCompleto: nombre_completo || null,
    reniecDepartamento: departamento || null,
    reniecProvincia: provincia || null,
    reniecDistrito: distrito || null,
    reniecDireccion: direccion || null,
    reniecDireccionCompleta: direccion_completa || null,
    reniecUbigeoReniec: ubigeo_reniec || null,
    reniecUbigeoSunat: ubigeo_sunat || null,
    reniecUbigeo: ubigeo || null,
  };
};
