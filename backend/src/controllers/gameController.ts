import { Request, Response } from 'express';
import { db } from '../services/mock/db';
import { boltic } from '../services/mock/boltic';
import { fynd } from '../services/mock/fynd';
import { GameSession } from '../models/types';

// Config
const WIN_LIMITS = {
  daily: 1,
  weekly: 3
};

const COIN_RATES: Record<string, number> = {
  'quiz': 0.1, // Score / 10
  'pattern': 0.2,
  'sandfall': 0.05 // New game
};

export const startGame = async (req: Request, res: Response) => {
  const { userId, gameName } = req.body;
  const sessionId = `sess-${Date.now()}`;
  
  // Create session
  const session: GameSession = {
    sessionId,
    userId,
    gameName,
    score: 0,
    coinsEarned: 0,
    completedAt: 0,
    isCartRecovery: false
  };
  
  db.sessions[sessionId] = session;
  res.json({ sessionId, status: 'started' });
};

export const submitScore = async (req: Request, res: Response) => {
  const { sessionId, score } = req.body;
  const session = db.sessions[sessionId];
  
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  session.score = score;
  session.completedAt = Date.now();
  
  // Calculate Coins
  const rate = COIN_RATES[session.gameName] || 0.1;
  const coinsEarned = Math.floor(score * rate);
  session.coinsEarned = coinsEarned;
  
  // Update User
  const user = db.users[session.userId];
  if (user) {
    user.coinsBalance += coinsEarned;
    user.totalGamesPlayed += 1;
  }

  // Check Reward Eligibility (Mock Logic)
  let reward = null;
  // If cart recovery or Lucky user (random chance for demo)
  const isWinner = Math.random() > 0.7; // 30% win rate for demo
  
  if (isWinner && user && user.winsThisWeek < WIN_LIMITS.weekly) {
    // Generate Reward
    const discount = Math.random() > 0.9 ? 50 : (Math.random() > 0.6 ? 25 : 10);
    const mockReward = await fynd.createCoupon(user.userId, discount);
    
    reward = {
      rewardId: `rew-${Date.now()}`,
      userId: user.userId,
      rewardType: 'game_win',
      rewardTier: discount >= 40 ? 'GRAND' : 'STANDARD',
      discountPercentage: discount,
      couponCode: mockReward.code,
      expiryDate: Date.now() + 48*3600*1000,
      redeemed: false,
      distributedAt: Date.now()
    };
    
    db.rewards[reward.rewardId] = reward;
    user.totalWins += 1;
    user.winsThisWeek += 1;
  }

  // Update Leaderboard
  await boltic.insertLeaderboardEntry({
    userId: user.userId,
    gameName: session.gameName,
    score,
    weekNumber: 1, // Mock week
    timestamp: Date.now()
  });

  res.json({
    status: 'completed',
    coinsEarned,
    reward,
    userStats: {
      newBalance: user.coinsBalance,
      winsThisWeek: user.winsThisWeek
    }
  });
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const { gameName } = req.params;
  const leaderboard = await boltic.getLeaderboard(gameName, 1); // Mock Week 1
  res.json(leaderboard);
};
