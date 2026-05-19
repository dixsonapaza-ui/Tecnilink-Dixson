import { setupAuthenticatedUsers, runCoreFlow } from './helpers.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.95'],
  },
};

export const setup = setupAuthenticatedUsers;

export default function (data) {
  runCoreFlow(data, { pause: 1 });
}
