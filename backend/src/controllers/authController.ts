import { Request, Response } from 'express';
import { db } from '../services/mock/db';

export const login = async (req: Request, res: Response) => {
  // Mock Login - in real world this accepts OAuth code
  // For mock, just send any userId
  const { userId = 'test-user' } = req.body;
  
  // Ensure user exists in mock DB
  if (!db.users[userId]) {
    db.users[userId] = {
      userId,
      fyndUserId: `fynd-${userId}`,
      coinsBalance: 100, // Welcome bonus
      dailyLoginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 0,
      totalWins: 0,
      winsThisWeek: 0,
      createdAt: Date.now()
    };
  }

  // Return "token" (just userId for mock)
  res.json({
    token: `mock-jwt-${userId}`,
    user: db.users[userId]
  });
};
