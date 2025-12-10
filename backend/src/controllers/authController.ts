import { Request, Response } from 'express';
import { db } from '../services/mock/db';

export const login = async (req: Request, res: Response) => {
  // Mock Login - in real world this accepts OAuth code
  const { userId = 'test-user', password } = req.body;
  
  // Basic Password Check (Mock)
  // If user exists, check 'password'. In real app, we check hashed password.
  // We'll store a mock password map in memory for this demo or just hardcode "pass123" for safety
  
  if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
  }

  if (password !== 'pass123') {
      res.status(401).json({ error: 'Invalid Password' });
      return;
  }
  
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
