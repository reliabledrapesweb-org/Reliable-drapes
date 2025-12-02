/**
 * Authentication-related type definitions
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  full_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  user?: AuthUser;
  session?: AuthSession;
  userId?: string;
}
