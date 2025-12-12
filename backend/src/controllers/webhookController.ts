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
    // Prefer query param, else discover from body (customer_id)
    let userId = (req.query.user_id as string) || undefined;
    const { cart_json_data } = req.body || {};

    // Helper: extract the first nested object's `id` from any arbitrary JSON body
    const getFirstSubobjectId = (payload: any): string | undefined => {
      try {
        if (!payload) return undefined;
        if (Array.isArray(payload)) {
          const first = payload[0];
          if (first && typeof first === "object") {
            if (typeof (first as any).id !== "undefined")
              return String((first as any).id);
            // Also allow first nested value inside first element
            for (const v of Object.values(first)) {
              if (
                v &&
                typeof v === "object" &&
                typeof (v as any).id !== "undefined"
              )
                return String((v as any).id);
            }
          }
          return undefined;
        }
        if (typeof payload === "object") {
          for (const v of Object.values(payload)) {
            if (!v) continue;
            if (typeof v === "object") {
              if (typeof (v as any).id !== "undefined")
                return String((v as any).id);
              if (
                Array.isArray(v) &&
                v[0] &&
                typeof v[0] === "object" &&
                typeof (v[0] as any).id !== "undefined"
              ) {
                return String((v[0] as any).id);
              }
            }
          }
        }
      } catch (_) {
        // swallow and continue with fallback
      }
      return undefined;
    };

    // Helper: extract a `customer_id` from arbitrary JSON body (top-level, nested object, or first array element)
    const getFirstCustomerId = (payload: any): string | undefined => {
      try {
        if (!payload) return undefined;
        const pick = (obj: any): string | undefined => {
          if (obj && typeof obj === "object") {
            if (typeof (obj as any).customer_id !== "undefined")
              return String((obj as any).customer_id);
          }
          return undefined;
        };

        // Direct on root
        const direct = pick(payload);
        if (direct) return direct;

        // If array: inspect first element and its nested values
        if (Array.isArray(payload)) {
          const first = payload[0];
          const fromFirst = pick(first);
          if (fromFirst) return fromFirst;
          if (first && typeof first === "object") {
            for (const v of Object.values(first)) {
              const nested = pick(v);
              if (nested) return nested;
            }
          }
          return undefined;
        }

        // If object: inspect its values (one level) and their first array elements
        if (typeof payload === "object") {
          for (const v of Object.values(payload)) {
            const fromValue = pick(v);
            if (fromValue) return fromValue;
            if (Array.isArray(v)) {
              const val = pick(v[0]);
              if (val) return val;
            } else if (v && typeof v === "object") {
              // one more shallow level
              const deeper = pick(v);
              if (deeper) return deeper;
              for (const vv of Object.values(v)) {
                const deeper2 = pick(vv);
                if (deeper2) return deeper2;
              }
            }
          }
        }
      } catch (_) {
        // ignore
      }
      return undefined;
    };

    // Resolve userId if not provided in query
    if (!userId) {
      const discoveredCustomerId =
        cart_json_data?.customer_id ?? getFirstCustomerId(req.body);
      if (discoveredCustomerId) {
        userId = String(discoveredCustomerId);
      }
    }

    if (!userId) {
      res
        .status(400)
        .json({
          error: "user id not provided (user_id query or customer_id in body)",
        });
      return;
    }

    console.log(`[AbandonedCart] Processing for user: ${userId}`);
    console.log(
      `[AbandonedCart] Cart data:`,
      cart_json_data ? "received" : "not provided"
    );

    // Extract cart ID if available (bypass: accept any body shape; use first subobject id if present)
    const fallbackId = `cart-${Date.now()}`;
    const discoveredId = cart_json_data?.id ?? getFirstSubobjectId(req.body);
    const cartId = discoveredId ? String(discoveredId) : fallbackId;

    // Generate the game recovery URL
    const gameUrl = new URL(`/game/${RECOVERY_GAME}`, FRONTEND_URL);
    gameUrl.searchParams.set("mode", "popup");
    gameUrl.searchParams.set("mobileNumber", userId);
    gameUrl.searchParams.set("cartId", cartId);
    gameUrl.searchParams.set("isCartRecovery", "true");

    // Log this abandonment event
    const abandonmentRecord = {
      cartId,
      mobileNumber: userId,
      items: Array.isArray(cart_json_data?.items) ? cart_json_data.items : [],
      cartValue:
        typeof cart_json_data?.breakup_values?.raw?.total === "number"
          ? cart_json_data.breakup_values.raw.total
          : 0,
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
      mobileNumber: userId,
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
