import { Request, Response } from 'express';
import { db } from '../services/mock/db';

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = db.users[userId];

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Fetch User Rewards
  const userRewards = Object.values(db.rewards).filter(r => r.userId === userId);
  
  res.json({
      ...user,
      rewards: userRewards
  });
};
