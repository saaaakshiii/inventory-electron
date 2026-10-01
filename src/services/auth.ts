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


export interface SignupResult {
  access_token: string;
  refresh_token: string;
  role: 'admin' | 'operator' | 'viewer';
  subject: string;
}
 
export async function signupOperator(
  name: string,
  phone: string,
  password: string,
): Promise<SignupResult> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/operator/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password }),
  });
 
  if (!res.ok) {
    let message = 'Signup failed. Please try again.';
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') {
        message = data.detail; // e.g. "Phone number already registered"
      } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg; // FastAPI validation error
      }
    } catch {
      /* non-JSON error body – keep default message */
    }
    throw new Error(message);
  }
 
  return res.json();
}