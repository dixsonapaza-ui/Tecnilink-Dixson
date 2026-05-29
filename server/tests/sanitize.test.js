import { describe, it, expect } from 'vitest';
import { sanitizeObject } from '../src/utils/sanitize.js';

describe('Sanitize Utils', () => {
  it('debería enmascarar contraseñas en un objeto plano', () => {
    const data = { username: 'admin', password: 'mypassword123', age: 30 };
    const sanitized = sanitizeObject(data);
    
    expect(sanitized).toEqual({
      username: 'admin',
      password: '[REDACTED]',
      age: 30
    });
  });

  it('debería enmascarar tokens anidados', () => {
    const data = {
      user: { name: 'Luis' },
      auth: { token: 'jwt-super-secret-token' }
    };
    const sanitized = sanitizeObject(data);
    
    expect(sanitized).toEqual({
      user: { name: 'Luis' },
      auth: { token: '[REDACTED]' }
    });
  });

  it('no debería alterar arrays normales', () => {
    const data = ['manzana', 'pera', { authorization: 'Bearer 123' }];
    const sanitized = sanitizeObject(data);
    
    expect(sanitized).toEqual(['manzana', 'pera', { authorization: '[REDACTED]' }]);
  });
});
