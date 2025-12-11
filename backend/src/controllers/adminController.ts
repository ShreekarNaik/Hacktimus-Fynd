
import { Request, Response } from 'express';

// Mock Admin Credentials (In real app, use DB + Bcrypt)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin'
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Return success
    res.json({
      token: `admin-jwt-${Date.now()}`,
      admin: {
        username: username
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
};
