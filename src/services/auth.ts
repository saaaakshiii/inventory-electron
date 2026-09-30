import { apiRequest } from './api';
import type { UserRole } from '../types';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: UserRole;
  subject: string;
}

export async function login(
  role: UserRole,
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  const body =
    role === 'operator'
      ? {
          phone: identifier,
          password,
        }
      : {
          email: identifier,
          password,
        };

  return apiRequest<LoginResponse>(`/auth/${role}/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}