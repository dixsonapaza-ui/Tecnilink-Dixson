import { setupAuthenticatedUsers, runCoreFlow } from './helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 20000 },
    { duration: '3m', target: 50000 },
    { duration: '5m', target: 90000 },
    { duration: '5m', target: 90000 },
    { duration: '3m', target: 0 },
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
