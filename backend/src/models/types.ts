export interface User {
  userId: string;
  fyndUserId: string;
  coinsBalance: number;
  dailyLoginStreak: number;
  lastLoginDate: string;
  totalGamesPlayed: number;
  totalWins: number;
  winsThisWeek: number;
  createdAt: number;
  phoneNumber?: string;
  preferredStores?: string[];
  displayName?: string;
}

export interface GameSession {
  sessionId: string;
  userId: string;
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
  userId: string;
  gameName: string;
  score: number;
  weekNumber: number;
  timestamp: number;
}

export interface Reward {
  rewardId: string;
  userId: string;
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
  userId: string;
  items: any[];
  cartValue: number;
  createdAt: number;
  notificationSent: boolean;
  gameLink?: string;
  converted: boolean;
}
