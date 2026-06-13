export interface User {
  id?: string;
  username: string;
  email: string;
  eloRating?: number;
  matchesPlayed?: number;
  matchesWon?: number;
}

export interface AuthState {
  user: User | null;
  token?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  errors?: Array<{ field: string; message: string }>;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}
