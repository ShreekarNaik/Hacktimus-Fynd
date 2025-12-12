import { Request, Response } from "express";
import { boltic } from "../services/bolticService";

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const RECOVERY_GAME = "sandfall"; // Default game for cart recovery

// In-memory cart storage (in production, use Redis or database)
const carts: Record<string, any> = {};

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
    const mobileNumber = req.query.user_id as string;
    const { cart_json_data } = req.body;

    if (!mobileNumber) {
      res.status(400).json({ error: "user_id query parameter is required" });
      return;
    }

    console.log(`[AbandonedCart] Processing for user: ${mobileNumber}`);
    console.log(
      `[AbandonedCart] Cart data:`,
      cart_json_data ? "received" : "not provided"
    );

    // Extract cart ID if available
    const cartId = cart_json_data?.id || `cart-${Date.now()}`;

    // Generate the game recovery URL
    const gameUrl = new URL(`/game/${RECOVERY_GAME}`, FRONTEND_URL);
    gameUrl.searchParams.set("mode", "popup");
    gameUrl.searchParams.set("mobileNumber", mobileNumber);
    gameUrl.searchParams.set("cartId", cartId);
    gameUrl.searchParams.set("isCartRecovery", "true");

    // Log this abandonment event
    const abandonmentRecord = {
      cartId,
      mobileNumber,
      items: cart_json_data?.items || [],
      cartValue: cart_json_data?.breakup_values?.raw?.total || 0,
      createdAt: Date.now(),
      notificationSent: true,
      gameLink: gameUrl.toString(),
      converted: false,
    };

    // Store in local memory
    carts[cartId] = abandonmentRecord;

    // Log to Boltic Tables
    try {
      await boltic.insertRecord("cart_abandonments", abandonmentRecord);
    } catch (bolticError) {
      console.warn("[AbandonedCart] Failed to log to Boltic:", bolticError);
    }

    console.log(
      `[AbandonedCart] Generated recovery URL: ${gameUrl.toString()}`
    );

    res.json({
      url: gameUrl.toString(),
      cartId,
      mobileNumber,
    });
  } catch (error) {
    console.error("[AbandonedCart] Error:", error);
    res.status(500).json({ error: "Failed to generate recovery link" });
  }
};

// This endpoint simulates Fynd calling OUR webhook when a cart is created/updated
export const handleCartWebhook = async (req: Request, res: Response) => {
  const { event, payload } = req.body;
  console.log(`[Webhook] Received ${event}`, payload);

  if (
    event === "application/cart/create/v1" ||
    event === "application/cart/update/v1"
  ) {
    const cartId = payload.cartId || payload.id;
    if (cartId) {
      const cartRecord = {
        cartId,
        mobileNumber: payload.mobileNumber || payload.userId,
        items: payload.items || [],
        cartValue: payload.cartValue || 0,
        createdAt: payload.createdAt
          ? new Date(payload.createdAt).getTime()
          : Date.now(),
        notificationSent: false,
        converted: false,
      };

      carts[cartId] = cartRecord;

      try {
        await boltic.insertRecord("cart_abandonments", cartRecord);
      } catch (err) {
        console.warn("[Webhook] Failed to log cart to Boltic:", err);
      }
    }
  }

  res.json({ received: true });
};

// This endpoint simulates the "Boltic Workflow" firing to tell us "Cart Abandoned! Send Email!"
export const triggerAbandonment = async (req: Request, res: Response) => {
  const { cartId } = req.body;
  const cart = carts[cartId];

  if (!cart) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }

  if (cart.notificationSent) {
    res.json({ status: "already_sent" });
    return;
  }

  try {
    // Generate Recovery Link
    const gameLink = `${FRONTEND_URL}/recovery?cartId=${cartId}&mobileNumber=${cart.mobileNumber}`;

    // Send notification via Boltic
    await boltic.sendNotification(
      "mock-user@example.com",
      "cart_recovery_game",
      { gameLink }
    );

    cart.notificationSent = true;
    cart.gameLink = gameLink;

    // Update in Boltic
    await boltic.updateCartAbandonment(cartId, {
      notificationSent: true,
      gameLink,
    });

    res.json({ status: "notification_sent", gameLink });
  } catch (err: any) {
    console.error("[Webhook] Error triggering abandonment:", err);
    res
      .status(500)
      .json({ error: "Failed to trigger abandonment notification" });
  }
};
