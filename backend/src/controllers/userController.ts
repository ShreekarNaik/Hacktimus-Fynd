import { Request, Response } from 'express';
import { db } from '../services/mock/db';

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.query.userId as string || 'test-user';
  const user = db.users[userId];
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
};

export const getRewards = async (req: Request, res: Response) => {
  const userId = req.query.userId as string || 'test-user';
  // Filter rewards from db
  const userRewards = Object.values(db.rewards).filter(r => r.userId === userId);
  res.json(userRewards);
};
