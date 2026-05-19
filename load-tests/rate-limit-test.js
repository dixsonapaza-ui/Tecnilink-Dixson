import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import http from 'k6/http';

import { BASE_URL, SEED_PASSWORD } from './helpers.js';

export const rateLimitedResponses = new Counter('rate_limited_responses');

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 400, 401, 429));

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    rate_limited_responses: ['count>0'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'luis.cliente@tecnilink.test',
      password: `${SEED_PASSWORD}-wrong`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { name: 'POST /api/auth/login rate limit' },
    },
  );

  if (response.status === 429) {
    rateLimitedResponses.add(1);
  }

  check(response, {
    'login returns expected auth or rate limit status': (res) =>
      [400, 401, 429].includes(res.status),
  });

  sleep(0.2);
}
