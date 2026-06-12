import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    high_volume: {
      executor: 'constant-vus',
      vus: 150,                // 150 usuarios virtuales concurrentes
      duration: '1m',          // Durante 1 minuto
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Menos del 5% de solicitudes fallidas
    http_req_duration: ['p(95)<2000'], // El 95% de las peticiones deben responder en menos de 2s
  },
};

export const BASE_URL = __ENV.BASE_URL || 'https://tecnilink-backend.onrender.com';

export default function () {
  // Apunta a /api/health para probar la capacidad de red y procesamiento del servidor Express.
  // Es ideal para alto volumen de peticiones (10k - 50k) porque no satura la escritura en BD Neon.
  const response = http.get(`${BASE_URL}/api/health`, {
    tags: { name: 'GET /api/health' },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'has status ok': (res) => res.json('status') === 'ok',
  });
}
