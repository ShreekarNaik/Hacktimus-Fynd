import { User, GameSession, LeaderboardEntry, Reward, CartAbandonment } from '../../models/types';
import { IDatabase } from '../interfaces';

class MockDB implements IDatabase {
  public users: Record<string, User> = {};
  public sessions: Record<string, GameSession> = {};
  public leaderboards: LeaderboardEntry[] = [];
  public rewards: Record<string, Reward> = {};
  public carts: Record<string, CartAbandonment> = {};

  constructor() {
    console.log('MockDB initialized with in-memory storage.');
    
    // Seed a test user
    this.users['test-user'] = {
      userId: 'test-user',
      fyndUserId: 'fynd-user-1',
      coinsBalance: 1000,
      dailyLoginStreak: 5,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 10,
      totalWins: 2,
      winsThisWeek: 2,
      createdAt: Date.now()
    };
  }
}

export const db = new MockDB();
