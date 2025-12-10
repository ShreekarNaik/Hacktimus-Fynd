import { Request, Response } from 'express';
import { db } from '../services/mock/db';

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = db.users[userId];

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
};
