import { describe, it, expect } from 'vitest';
import { getPagination, buildPaginationMeta } from '../src/utils/pagination.js';

describe('Pagination Utils', () => {
  it('debería calcular el skip y take correctamente con valores por defecto', () => {
    const options = getPagination({ page: 1, limit: 10 });
    expect(options).toEqual({ page: 1, limit: 10, skip: 0, take: 10 });
  });

  it('debería calcular los metadatos de paginación correctamente', () => {
    const response = buildPaginationMeta({ page: 2, limit: 10, total: 50 });
    expect(response).toEqual({
      total: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
    });
  });
});
