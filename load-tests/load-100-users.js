import { setupAuthenticatedUsers, runCoreFlow } from './helpers.js';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.95'],
  },
};

export const setup = setupAuthenticatedUsers;

export default function (data) {
  runCoreFlow(data, { pause: 1 });
}
