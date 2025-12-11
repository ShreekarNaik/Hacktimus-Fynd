import { Request, Response } from 'express';
import { db } from '../services/mock/db';
import { boltic } from '../services/bolticService';

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const RECOVERY_GAME = 'sandfall'; // Default game for cart recovery

/**
 * Endpoint called by Boltic "Abandoned Cart Trigger" workflow
 * 
 * Expected Request:
 *   POST /abandoned_cart?user_id={customer_id}
 *   State Params: { cart_json_data: {...} }
 * 
 * Returns:
 *   { url: "https://fyndgames.example.com/game/sandfall?cartId=X&userId=Y&mode=popup" }
 */
export const handleAbandonedCart = async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    const { cart_json_data } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'user_id query parameter is required' });
      return;
    }

    console.log(`[AbandonedCart] Processing for user: ${userId}`);
    console.log(`[AbandonedCart] Cart data:`, cart_json_data ? 'received' : 'not provided');

    // Extract cart ID if available
    const cartId = cart_json_data?.id || `cart-${Date.now()}`;

    // Generate the game recovery URL
    // The URL opens the game in "popup" mode with cart context
    const gameUrl = new URL(`/game/${RECOVERY_GAME}`, FRONTEND_URL);
    gameUrl.searchParams.set('mode', 'popup');
    gameUrl.searchParams.set('userId', userId);
    gameUrl.searchParams.set('cartId', cartId);
    gameUrl.searchParams.set('isCartRecovery', 'true');

    // Log this abandonment event
    const abandonmentRecord = {
      cartId,
      userId,
      items: cart_json_data?.items || [],
      cartValue: cart_json_data?.breakup_values?.raw?.total || 0,
      createdAt: Date.now(),
      notificationSent: true,
      gameLink: gameUrl.toString(),
      converted: false
    };

    // Store in local mock DB
    db.carts[cartId] = abandonmentRecord;

    // Also log to Boltic Tables
    try {
      await boltic.insertRecord('cart_abandonments', abandonmentRecord);
    } catch (bolticError) {
      console.warn('[AbandonedCart] Failed to log to Boltic:', bolticError);
      // Continue anyway - local storage is primary for demo
    }

    console.log(`[AbandonedCart] Generated recovery URL: ${gameUrl.toString()}`);

    res.json({ 
      url: gameUrl.toString(),
      cartId,
      userId
    });
  } catch (error) {
    console.error('[AbandonedCart] Error:', error);
    res.status(500).json({ error: 'Failed to generate recovery link' });
  }
};

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
