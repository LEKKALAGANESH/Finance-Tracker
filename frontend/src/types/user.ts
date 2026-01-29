export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  currency?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
