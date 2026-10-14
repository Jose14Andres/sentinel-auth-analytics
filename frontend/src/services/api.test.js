import { describe, it, expect, beforeEach } from 'vitest';
import API from './api';

describe('API Request Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header if sentinel_token exists in localStorage', async () => {
    const token = 'fake-jwt-token';
    localStorage.setItem('sentinel_token', token);

    const requestInterceptor = API.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header if sentinel_token is missing', async () => {
    const requestInterceptor = API.interceptors.request.handlers[0].fulfilled;

    const config = { headers: {} };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
