import { Request, Response } from 'express';
import { db } from '../services/mock/db';
import { boltic } from '../services/mock/boltic';
import { fynd } from '../services/mock/fynd';
import { GameSession, User } from '../models/types';

// Config
const WIN_LIMITS = {
  daily: 1,
  weekly: 3
};

const COIN_RATES: Record<string, number> = {
  'quiz': 0.1, // Score / 10
  'pattern': 0.2, // Score / 5
  'sandfall': 0.05 // Score / 20
};

export const startGame = async (req: Request, res: Response) => {
  const { userId, gameName, fyndUserId } = req.body;
  
  if (!userId) {
     res.status(400).json({ error: 'userId is required' });
     return;
  }

  // Ensure user exists (Mock Auto-Registration)
  if (!db.users[userId]) {
    console.log(`[GameController] Creating new mock user: ${userId}`);
    const newUser: User = {
      userId,
      fyndUserId: fyndUserId || `fynd-${Date.now()}`,
      coinsBalance: 0,
      dailyLoginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 0,
      totalWins: 0,
      winsThisWeek: 0,
      createdAt: Date.now()
    };
    db.users[userId] = newUser;
    // In real app, we would sync this to Boltic Users table
    await boltic.insertRecord('users', newUser);
  }

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

  if (session.completedAt > 0) {
      res.status(400).json({ error: 'Session already completed' });
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
  } else {
      console.error(`[GameController] User ${session.userId} not found during submit!`);
  }

  // Check Reward Eligibility (Mock Logic)
  let reward = null;
  // If cart recovery or Lucky user (random chance for demo)
  const isWinner = Math.random() > 0.7; // 30% win rate for demo
  
  if (isWinner && user && user.winsThisWeek < WIN_LIMITS.weekly) {
    // Generate Reward via Fynd Service
    const discount = Math.random() > 0.9 ? 50 : (Math.random() > 0.6 ? 25 : 10);
    const mockReward = await fynd.createCoupon(user.userId, discount);
    
    reward = {
      rewardId: `rew-${Date.now()}`,
      userId: user.userId,
      rewardType: 'game_win',
      rewardTier: discount >= 40 ? 'GRAND' : 'STANDARD',
      discountPercentage: discount,
      couponCode: mockReward.code,
      expiryDate: new Date(mockReward.validity.end).getTime(),
      redeemed: false,
      distributedAt: Date.now()
    };
    
    db.rewards[reward.rewardId] = reward;
    user.totalWins += 1;
    user.winsThisWeek += 1;

    // Log reward to Boltic
    await boltic.insertRecord('rewards', reward);
  }

  // Update Leaderboard via Boltic Service
  await boltic.insertLeaderboardEntry({
    userId: session.userId,
    gameName: session.gameName,
    score,
    weekNumber: 1, // Mock week
    timestamp: Date.now()
  });

  res.json({
    status: 'completed',
    coinsEarned,
    reward,
    userStats: user ? {
      newBalance: user.coinsBalance,
      winsThisWeek: user.winsThisWeek
    } : null
  });
};

export const claimLeaderboardReward = async (req: Request, res: Response) => {
    const { userId, gameName } = req.body;
    
    // 1. Verify User is #1
    const leaderboard = await boltic.getLeaderboard(gameName, 1);
    const topEntry = leaderboard[0];
    
    if (!topEntry || topEntry.userId !== userId) {
        res.status(400).json({ error: 'You are not eligible for this reward. Rank #1 required.' });
        return;
    }
    
    // 2. Generate Reward
    const discount = 75; // Grand prize
    const mockReward = await fynd.createCoupon(userId, discount, 168); // 1 week expiry
    
    const reward = {
      rewardId: `rew-grand-${Date.now()}`,
      userId: userId,
      rewardType: 'leaderboard_champion',
      rewardTier: 'LEGENDARY',
      discountPercentage: discount,
      couponCode: mockReward.code,
      expiryDate: new Date(mockReward.validity.end).getTime(),
      redeemed: false,
      distributedAt: Date.now(),
      metadata: { game: gameName, score: topEntry.score }
    };
    
    // 3. Save Reward
    db.rewards[reward.rewardId] = reward;
    await boltic.insertRecord('rewards', reward);
    
    // 4. Remove from Leaderboard (Consume the win)
    await boltic.removeLeaderboardEntry(userId, gameName);
    
    res.json({ status: 'claimed', reward });
};

export const getPendingRewards = async (req: Request, res: Response) => {
    const { userId } = req.query;
    if (!userId) {
        res.status(400).json({ error: 'userId required' });
        return;
    }
    
    const games = ['sandfall', 'spin', 'scratch', 'quiz'];
    const pending = [];
    
    for (const g of games) {
        const lb = await boltic.getLeaderboard(g, 1);
        if (lb.length > 0 && lb[0].userId === String(userId)) {
            pending.push({
                gameName: g,
                reason: 'Rank #1 Champion',
                claimable: true
            });
        }
    }
    
    res.json(pending);
};

export const getLeaderboard = async (req: Request, res: Response) => {
  const { gameName } = req.params;
  const leaderboard = await boltic.getLeaderboard(gameName, 1); // Mock Week 1
  res.json(leaderboard);
};
