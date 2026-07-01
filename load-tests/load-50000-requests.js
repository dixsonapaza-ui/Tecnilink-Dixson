import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    high_volume: {
      executor: 'constant-vus',
      vus: 150,                // 150 usuarios virtuales
      duration: '10s',         // Ejecutar por exactamente 10 segundos
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Menos del 5% de solicitudes fallidas
  },
};

const BASE_URL = 'http://localhost:4000';

export default function () {
  const response = http.get(`${BASE_URL}/api/health?quick=true`, {
    tags: { name: 'GET /api/health?quick=true' },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'has status ok': (res) => res.json('status') === 'ok',
  });
}
