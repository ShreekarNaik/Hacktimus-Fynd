export interface User {
  userId: string;
  coinsBalance: number;
  dailyLoginStreak: number;
  totalWins: number;
  winsThisWeek: number;
  preferredStores?: string[];
  phoneNumber?: string; // Also adding phoneNumber as it was used in mock data
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Admin Types
export interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

export interface CouponTemplate {
  id: string;
  brandId: string;
  couponPrefix: string;
  validityDays: number;
  rarityPercentage: number; // 0-100, lower = more rare
  discountPercentage: number;
  redeemUrl: string;
  terms: string;
  createdAt: string;
}

export interface AdminUser {
  username: string;
}

export interface AdminState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
