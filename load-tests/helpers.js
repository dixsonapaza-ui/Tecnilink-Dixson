import { check, group, sleep } from 'k6';
import http from 'k6/http';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
export const SEED_PASSWORD = __ENV.SEED_PASSWORD || 'Tecnilink123!';

export const clientUsers = [
  { email: 'luis.cliente@tecnilink.test', password: SEED_PASSWORD },
  { email: 'ana.cliente@tecnilink.test', password: SEED_PASSWORD },
  { email: 'diego.cliente@tecnilink.test', password: SEED_PASSWORD },
];

export const adminUser = {
  email: 'admin@tecnilink.test',
  password: SEED_PASSWORD,
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export const authHeaders = (token) => ({
  headers: {
    ...jsonHeaders,
    Authorization: `Bearer ${token}`,
  },
});

export const login = (credentials) => {
  const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(credentials), {
    headers: jsonHeaders,
    tags: { name: 'POST /api/auth/login' },
  });

  check(response, {
    'login status is 200': (res) => res.status === 200,
    'login returns token': (res) => Boolean(res.json('token')),
  });

  return response.json('token');
};

export const setupAuthenticatedUsers = () => {
  const clientTokens = clientUsers.map((user) => login(user)).filter(Boolean);
  const adminToken = login(adminUser);

  const categoryResponse = http.get(`${BASE_URL}/api/categories?page=1&limit=100`, {
    ...authHeaders(clientTokens[0] || adminToken),
    tags: { name: 'GET /api/categories' },
  });

  const categories = categoryResponse.json('data') || [];

  check(categoryResponse, {
    'categories status is 200': (res) => res.status === 200,
    'categories available': () => categories.length > 0,
  });

  return {
    adminToken,
    clientTokens,
    categories,
  };
};

export const pickClientToken = (data) => {
  const tokens = data.clientTokens || [];
  return tokens[(__VU - 1) % tokens.length];
};

export const pickCategoryId = (data) => {
  const categories = data.categories || [];
  return categories[(__VU - 1) % categories.length]?.id;
};

export const runCoreFlow = (data, options = {}) => {
  const token = pickClientToken(data);
  const categoryId = pickCategoryId(data);
  const pause = options.pause ?? 1;

  group('health', () => {
    const response = http.get(`${BASE_URL}/api/health`, {
      tags: { name: 'GET /api/health' },
    });

    check(response, {
      'health status is 200': (res) => res.status === 200,
      'health has status field': (res) => Boolean(res.json('status')),
    });
  });

  group('categories', () => {
    const response = http.get(`${BASE_URL}/api/categories?page=1&limit=20`, {
      ...authHeaders(token),
      tags: { name: 'GET /api/categories' },
    });

    check(response, {
      'categories list status is 200': (res) => res.status === 200,
    });
  });

  let createdRequestId = null;

  if (categoryId) {
    group('create request', () => {
      const payload = {
        title: `Prueba k6 VU ${__VU} iter ${__ITER}`,
        description: 'Solicitud generada por prueba de carga k6 para validar flujo principal.',
        priority: ['BAJA', 'MEDIA', 'ALTA'][__ITER % 3],
        categoryId,
      };

      const response = http.post(`${BASE_URL}/api/requests`, JSON.stringify(payload), {
        ...authHeaders(token),
        tags: { name: 'POST /api/requests' },
      });

      check(response, {
        'create request status is 201': (res) => res.status === 201,
        'create request returns id': (res) => Boolean(res.json('request.id')),
      });

      createdRequestId = response.json('request.id');
    });
  }

  group('list requests', () => {
    const response = http.get(`${BASE_URL}/api/requests?page=1&limit=20`, {
      ...authHeaders(token),
      tags: { name: 'GET /api/requests?page=1&limit=20' },
    });

    check(response, {
      'requests list status is 200': (res) => res.status === 200,
      'requests list has meta': (res) => Boolean(res.json('meta')),
    });

    if (!createdRequestId) {
      createdRequestId = response.json('data.0.id');
    }
  });

  if (createdRequestId) {
    group('request detail', () => {
      const response = http.get(`${BASE_URL}/api/requests/${createdRequestId}`, {
        ...authHeaders(token),
        tags: { name: 'GET /api/requests/:id' },
      });

      check(response, {
        'request detail status is 200': (res) => res.status === 200,
      });
    });
  }

  sleep(pause);
};
