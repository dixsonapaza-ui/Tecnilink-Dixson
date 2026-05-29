import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba de carga
export const options = {
  stages: [
    { duration: '10s', target: __ENV.VUS ? parseInt(__ENV.VUS) : 20 }, 
    { duration: '30s', target: __ENV.VUS ? parseInt(__ENV.VUS) : 20 }, 
    { duration: '10s', target: 0 },  
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben ser menores a 500ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de peticiones pueden fallar
  },
};

const BASE_URL = 'http://localhost:4000/api';

export default function () {
  // 1. Prueba de Salud (Endpoint público sin autenticación)
  // Ideal para probar concurrencia alta
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check responds fast': (r) => r.timings.duration < 500,
  });

  // Nota sobre endpoints autenticados:
  // Si deseas probar endpoints como /api/requests, necesitas hacer login primero.
  // IMPORTANTE: El servidor tiene un limitador de tasa para login (LOGIN_RATE_LIMIT_MAX=5).
  // Para pruebas de carga reales, debes desactivar el rate limit o usar tokens pre-generados.
  /*
  const loginPayload = JSON.stringify({
    email: 'admin@tecnilink.com',
    password: 'password123',
  });
  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const token = loginRes.json('token');
  
  if (token) {
    const requestsRes = http.get(`${BASE_URL}/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    check(requestsRes, {
      'requests status is 200': (r) => r.status === 200
    });
  }
  */

  sleep(1);
}
