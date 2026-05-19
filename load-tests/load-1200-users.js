import { setupAuthenticatedUsers, runCoreFlow } from './helpers.js';

export const options = {
  stages: [
    { duration: '3m', target: 100 },
    { duration: '5m', target: 300 },
    { duration: '7m', target: 600 },
    { duration: '8m', target: 900 },
    { duration: '10m', target: 1200 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.90'],
  },
};

export const setup = setupAuthenticatedUsers;

export default function (data) {
  runCoreFlow(data, { pause: 1 });
}
