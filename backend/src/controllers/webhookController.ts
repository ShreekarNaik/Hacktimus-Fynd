import { Request, Response } from 'express';
import { db } from '../services/mock/db';
import { boltic } from '../services/bolticService';

// This endpoint simulates Fynd calling OUR webhook when a cart is created/updated
export const handleCartWebhook = async (req: Request, res: Response) => {
  const { event, payload } = req.body;
  console.log(`[Webhook] Received ${event}`, payload);

  if (event === 'application/cart/create/v1' || event === 'application/cart/update/v1') {
    // In real app, we just log it. 
    // The "Abandonment" is detected by a scheduler (Boltic Workflow).
    // Here we can just simulate storing it for the mock scheduler.
    const cartId = payload.cartId || payload.id;
    if (cartId) {
      db.carts[cartId] = {
        cartId,
        userId: payload.userId,
        items: payload.items || [],
        cartValue: payload.cartValue || 0,
        createdAt: payload.createdAt ? new Date(payload.createdAt).getTime() : Date.now(),
        notificationSent: false,
        converted: false
      };
    }
  }

  res.json({ received: true });
};

// This endpoint simulates the "Boltic Workflow" firing to tell us "Cart Abandoned! Send Email!"
export const triggerAbandonment = async (req: Request, res: Response) => {
  const { cartId } = req.body;
  const cart = db.carts[cartId];
  
  if (!cart) {
     res.status(404).json({ error: 'Cart not found in mock DB' });
     return;
  }

  if (cart.notificationSent) {
     res.json({ status: 'already_sent' });
     return;
  }

  // Generate Recovery Link
  const gameLink = `http://localhost:5173/recovery?cartId=${cartId}&userId=${cart.userId}`;
  
  // Send "Email"
  await boltic.sendNotification(
    'mock-user@example.com', 
    'cart_recovery_game', 
    { gameLink }
  );

  cart.notificationSent = true;
  cart.gameLink = gameLink;

  res.json({ status: 'notification_sent', gameLink });
};
