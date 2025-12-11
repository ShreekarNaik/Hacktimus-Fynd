import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Fynd Promotional Games Platform API - Mock Backend');
});

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import gameRoutes from './routes/games';
import webhookRoutes from './routes/webhooks';
import adminRoutes from './routes/adminRoutes';
import { handleAbandonedCart } from './controllers/webhookController';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Root-level endpoint for Boltic workflow callback
// The "Abandoned Cart Trigger" workflow calls: POST {{BACKEND_BASE_URL}}/abandoned_cart
app.post('/abandoned_cart', handleAbandonedCart);
app.get('/abandoned_cart', handleAbandonedCart);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
