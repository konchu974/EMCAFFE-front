// src/lib/api/types/user.types.ts
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'OTHER',
}

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id_user_account: string;
  first_name: string;
  last_name: string;
  gender?: Gender;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  gender?: Gender;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  gender?: Gender;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
