import { setupAuthenticatedUsers, runCoreFlow } from './helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.95'],
  },
};

export const setup = setupAuthenticatedUsers;

export default function (data) {
  runCoreFlow(data, { pause: 1 });
}
