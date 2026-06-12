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
    http_req_duration: ['p(95)<4500'], // Ajustado para latencia de red WAN en plan gratuito de Render
  },
};

export const BASE_URL = __ENV.BASE_URL || 'https://tecnilink-backend.onrender.com';

export default function () {
  // Apunta a /api/health?quick=true para responder en memoria desde Express sin sobrecargar la base de datos
  const response = http.get(`${BASE_URL}/api/health?quick=true`, {
    tags: { name: 'GET /api/health?quick=true' },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'has status ok': (res) => res.json('status') === 'ok',
  });
}
