import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_URL ||
  'http://localhost:8080';

export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<{ access_token: string; refresh_token: string }> | null = null;

// auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const original: any = error.config;

    if (status === 401 && original && !original._retry) {
      original._retry = true;

      const rt = tokenStorage.getRefreshToken();
      if (!rt) {
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = publicApi
            .post('/auth/refresh', { refresh_token: rt })
            .then((r) => r.data)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const tokens = await refreshPromise;

        tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${tokens.access_token}`;

        return api.request(original);
      } catch (e) {
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);
