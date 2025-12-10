export interface User {
  userId: string;
  coinsBalance: number;
  dailyLoginStreak: number;
  totalWins: number;
  winsThisWeek: number;
  // ... other fields
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
