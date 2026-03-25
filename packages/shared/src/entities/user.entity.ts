import { UserRole } from '../enums';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  nickname: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserPublic {
  id: string;
  email: string;
  role: UserRole;
  nickname: string;
  avatarUrl: string | null;
  createdAt: Date;
}
