export interface User {
  mobileNumber: string; // Primary Key
  username: string; // Required unique username
  coinsBalance: number;
  dailyLoginStreak: number;
  lastLoginDate: string;
  totalGamesPlayed: number;
  totalWins: number;
  winsThisWeek: number;
  createdAt: number;
  preferredStores?: string[];
  displayName?: string;
  // fyndUserId and userId removed
}

export interface GameSession {
  sessionId: string;
  mobileNumber: string;
  gameName: string;
  score: number;
  coinsEarned: number;
  rewardTier?: string;
  completedAt: number;
  isCartRecovery: boolean;
  cartId?: string;
}

export interface LeaderboardEntry {
  id: string;
  mobileNumber: string;
  username?: string;
  gameName: string;
  score: number;
  weekNumber: number;
  timestamp: number;
}

export interface Reward {
  rewardId: string;
  mobileNumber: string;
  rewardType: string;
  rewardTier: string; // GRAND, PREMIUM, STANDARD, BASIC
  discountPercentage: number;
  couponCode: string;
  expiryDate: number;
  redeemed: boolean;
  distributedAt: number;
}

export interface CartAbandonment {
  cartId: string;
  mobileNumber: string;
  items: any[];
  cartValue: number;
  createdAt: number;
  notificationSent: boolean;
  gameLink?: string;
  converted: boolean;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: number;
}

export interface CouponTemplate {
  id: string;
  brandId: string;
  couponPrefix: string;
  discountPercentage: number;
  validityDays: number;
  rarityPercentage: number;
  redeemUrl: string;
  terms: string;
  createdAt: number;
}
