import { publicApi } from './apiClient';

export type LoginRequest = { email: string; password: string };

export type LoginResponse = {
  user: { id: string; role: string };
  access_token: string;
  refresh_token: string;
};

export type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await publicApi.post('/auth/login', payload);
    return res.data;
  },
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const res = await publicApi.post('/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },
};
