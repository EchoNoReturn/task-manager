import { UserPublic } from '../entities';
import { RegistrationMode } from '../enums';

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduleResult {
  userId: string;
  totalHours: number;
  estimatedDays: number;
  availableDate: Date;
}

export interface RegistrationSettings {
  mode: RegistrationMode;
}

export interface RegistrationRequest {
  id: string;
  email: string;
  passwordHash?: string;
  nickname: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
