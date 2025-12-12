import { Request, Response } from "express";
import { boltic } from "../services/bolticService";
import * as fyndApi from "../services/fyndApi";
import { GameSession, User } from "../models/types";

// Config
const WIN_LIMITS = {
  daily: 1,
  weekly: 3,
};

const COIN_RATES: Record<string, number> = {
  quiz: 0.1, // Score / 10
  pattern: 0.2, // Score / 5
  sandfall: 0.05, // Score / 20
};

// Win rate configuration (can be made env-configurable)
const WIN_RATE = parseFloat(process.env.GAME_WIN_RATE || "0.3"); // 30% default

// In-memory session storage (in production, use Redis or database)
const sessions: Record<string, GameSession> = {};

/**
 * Calculate ISO week number for a given date
 * Used for weekly leaderboard cycles
 */
function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export const startGame = async (req: Request, res: Response) => {
  const { mobileNumber, gameName } = req.body;

  if (!mobileNumber) {
    res.status(400).json({ error: "mobileNumber is required" });
    return;
  }

  try {
    // Ensure user exists in Boltic
    const user = await boltic.getUser(mobileNumber);

    if (!user) {
      console.log(`[GameController] User not found: ${mobileNumber}`);
      res.status(404).json({ error: "User not found. Please register first." });
      return;
    }

    const sessionId = `sess-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Create session
    const session: GameSession = {
      sessionId,
      mobileNumber,
      gameName,
      score: 0,
      coinsEarned: 0,
      completedAt: 0,
      isCartRecovery: false,
    };

    sessions[sessionId] = session;
    res.json({ sessionId, status: "started" });
  } catch (err: any) {
    console.error("[GameController] Error starting game:", err);
    res.status(500).json({ error: "Failed to start game" });
  }
};

export const submitScore = async (req: Request, res: Response) => {
  const { sessionId, score } = req.body;
  const session = sessions[sessionId];

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.completedAt > 0) {
    res.status(400).json({ error: "Session already completed" });
    return;
  }

  try {
    session.score = score;
    session.completedAt = Date.now();

    // Calculate Coins
    const rate = COIN_RATES[session.gameName] || 0.1;
    const coinsEarned = Math.floor(score * rate);
    session.coinsEarned = coinsEarned;

    // Update User in Boltic
    const user = await boltic.getUser(session.mobileNumber);

    if (!user) {
      console.error(
        `[GameController] User ${session.mobileNumber} not found during submit!`
      );
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user stats
    await boltic.updateUser(session.mobileNumber, {
      coinsBalance: user.coinsBalance + coinsEarned,
      totalGamesPlayed: user.totalGamesPlayed + 1,
    });

    // Save game session to Boltic
    await boltic.insertRecord("game_sessions", session);

    // Check Reward Eligibility
    let reward = null;
    const isWinner = Math.random() < WIN_RATE;

    if (isWinner && user.winsThisWeek < WIN_LIMITS.weekly) {
      // Generate discount tier
      const rand = Math.random();
      const discount = rand > 0.9 ? 50 : rand > 0.6 ? 25 : 10;
      const rewardTier =
        discount >= 40 ? "GRAND" : discount >= 25 ? "PREMIUM" : "STANDARD";

      // Generate coupon code
      const couponCode = `GAME${discount}-${Date.now()
        .toString(36)
        .toUpperCase()}`;

      reward = {
        rewardId: `rew-${Date.now()}`,
        mobileNumber: session.mobileNumber,
        rewardType: "game_win",
        rewardTier,
        discountPercentage: discount,
        couponCode,
        expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        redeemed: false,
        distributedAt: Date.now(),
      };

      // Create the coupon payload for Boltic workflow
      const expiryDate = new Date(reward.expiryDate);
      const couponPayload = {
        rule_definition: {
          scope: ["brand_id"],
          calculate_on: "esp",
          is_exact: false,
          currency_code: "INR",
          type: "bundle",
          applicable_on: "quantity",
          auto_apply: false,
          value_type: "absolute",
        },
        display_meta: {
          description: `Congratulations! You won ${discount}% off playing ${session.gameName}`,
          remove: { subtitle: "", title: "" },
          apply: {
            subtitle: `You saved ${discount}% on your order!`,
            title: "Game Reward Applied!",
          },
          subtitle: `${discount}% discount from ${session.gameName} game`,
          auto: { subtitle: "", title: "" },
          title: `${discount}% Off - Game Reward`,
        },
        rule: [
          {
            max: 0,
            min: 100,
            value: discount,
            key: 2,
          },
        ],
        state: {
          is_display: true,
          is_archived: false,
          is_public: true,
        },
        identifiers: {
          user_id: [session.mobileNumber],
          brand_id: [9],
        },
        ownership: {
          payable_category: "seller",
          payable_by: "",
        },
        _schedule: {
          duration: null,
          end: expiryDate.toISOString(),
          next_schedule: [
            {
              start: new Date().toISOString(),
              end: expiryDate.toISOString(),
            },
          ],
          status: "approved",
          start: new Date().toISOString(),
          cron: null,
        },
        validation: {
          user_registered_after: null,
          app_id: ["5e1d9bec6d6b7e000146c840"],
          anonymous: true,
        },
        validity: {
          priority: 0,
        },
        action: {
          action_date: null,
          txn_mode: "coupon",
        },
        type_slug: "bundle_quantity_absolute",
        coupon_counts: 1,
        coupon_type: "single",
        coupon_prefix: `GAME${discount}_`,
        restrictions: {
          uses: {
            remaining: { app: -1, total: -1, user: -1 },
            maximum: { app: 2, total: 2, user: 2 },
          },
          post_order: {
            return_allowed: true,
            cancellation_allowed: true,
          },
          platforms: ["web", "android", "ios"],
        },
        code: couponCode,
      };

      try {
        // Call Boltic workflow to create the coupon in Fynd
        console.log(
          `[GameController] Creating coupon ${couponCode} for user ${session.mobileNumber} via Boltic workflow`
        );
        await boltic.createCouponViaBoltic(
          couponCode,
          session.mobileNumber,
          couponPayload
        );
        console.log(
          `[GameController] Coupon ${couponCode} created successfully`
        );
      } catch (workflowError: any) {
        console.error(
          "[GameController] Error creating coupon via Boltic workflow:",
          workflowError
        );
        // Continue anyway - we'll still save the reward to database
        // This allows the system to work even if Fynd API is down
      }

      // Save reward to Boltic database
      await boltic.insertRecord("rewards", reward);

      // Update user wins
      await boltic.updateUser(session.mobileNumber, {
        totalWins: user.totalWins + 1,
        winsThisWeek: user.winsThisWeek + 1,
      });
    }

    // Update Leaderboard via Boltic Service
    const currentWeek = getWeekNumber();
    await boltic.insertLeaderboardEntry({
      mobileNumber: session.mobileNumber,
      gameName: session.gameName,
      score,
      weekNumber: currentWeek,
      timestamp: Date.now(),
    });

    res.json({
      status: "completed",
      coinsEarned,
      reward,
      userStats: {
        newBalance: user.coinsBalance + coinsEarned,
        winsThisWeek: user.winsThisWeek + (reward ? 1 : 0),
      },
    });
  } catch (err: any) {
    console.error("[GameController] Error submitting score:", err);
    res
      .status(500)
      .json({ error: "Failed to submit score", details: err.message });
  }
};

export const claimLeaderboardReward = async (req: Request, res: Response) => {
  const { mobileNumber, gameName } = req.body;

  try {
    // 1. Verify User is #1 for current week
    const currentWeek = getWeekNumber();
    const leaderboard = await boltic.getLeaderboard(gameName, currentWeek);
    const topEntry = leaderboard[0];

    if (!topEntry || topEntry.mobileNumber !== mobileNumber) {
      res.status(400).json({
        error: "You are not eligible for this reward. Rank #1 required.",
      });
      return;
    }

    // 2. Generate Grand Prize Reward
    const discount = 75; // Grand prize
    const couponCode = `CHAMPION${discount}-${Date.now()
      .toString(36)
      .toUpperCase()}`;

    const reward = {
      rewardId: `rew-grand-${Date.now()}`,
      mobileNumber,
      rewardType: "leaderboard_champion",
      rewardTier: "LEGENDARY",
      discountPercentage: discount,
      couponCode,
      expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week expiry
      redeemed: false,
      distributedAt: Date.now(),
    };

    // Create the coupon payload for Boltic workflow
    const expiryDate = new Date(reward.expiryDate);
    const couponPayload = {
      rule_definition: {
        scope: ["brand_id"],
        calculate_on: "esp",
        is_exact: false,
        currency_code: "INR",
        type: "bundle",
        applicable_on: "quantity",
        auto_apply: false,
        value_type: "absolute",
      },
      display_meta: {
        description: `CHAMPION REWARD! You are #1 in ${gameName}!`,
        remove: { subtitle: "", title: "" },
        apply: {
          subtitle: `You saved ${discount}% as the champion!`,
          title: "Champion Reward Applied!",
        },
        subtitle: `${discount}% discount for being #1 champion`,
        auto: { subtitle: "", title: "" },
        title: `${discount}% Off - Champion Reward`,
      },
      rule: [
        {
          max: 0,
          min: 100,
          value: discount,
          key: 2,
        },
      ],
      state: {
        is_display: true,
        is_archived: false,
        is_public: true,
      },
      identifiers: {
        user_id: [mobileNumber],
        brand_id: [9],
      },
      ownership: {
        payable_category: "seller",
        payable_by: "",
      },
      _schedule: {
        duration: null,
        end: expiryDate.toISOString(),
        next_schedule: [
          {
            start: new Date().toISOString(),
            end: expiryDate.toISOString(),
          },
        ],
        status: "approved",
        start: new Date().toISOString(),
        cron: null,
      },
      validation: {
        user_registered_after: null,
        app_id: ["5e1d9bec6d6b7e000146c840"],
        anonymous: true,
      },
      validity: {
        priority: 0,
      },
      action: {
        action_date: null,
        txn_mode: "coupon",
      },
      type_slug: "bundle_quantity_absolute",
      coupon_counts: 1,
      coupon_type: "single",
      coupon_prefix: `CHAMPION${discount}_`,
      restrictions: {
        uses: {
          remaining: { app: -1, total: -1, user: -1 },
          maximum: { app: 2, total: 2, user: 2 },
        },
        post_order: {
          return_allowed: true,
          cancellation_allowed: true,
        },
        platforms: ["web", "android", "ios"],
      },
      code: couponCode,
    };

    try {
      // 3. Call Boltic workflow to create the coupon in Fynd
      console.log(
        `[GameController] Creating champion coupon ${couponCode} for user ${mobileNumber} via Boltic workflow`
      );
      await boltic.createCouponViaBoltic(
        couponCode,
        mobileNumber,
        couponPayload
      );
      console.log(
        `[GameController] Champion coupon ${couponCode} created successfully`
      );
    } catch (workflowError: any) {
      console.error(
        "[GameController] Error creating champion coupon via Boltic workflow:",
        workflowError
      );
      // Continue anyway - we'll still save the reward to database
    }

    // 4. Save Reward to database
    await boltic.insertRecord("rewards", reward);

    // 5. Remove from Leaderboard (Consume the win)
    await boltic.removeLeaderboardEntry(mobileNumber, gameName);

    res.json({ status: "claimed", reward });
  } catch (err: any) {
    console.error("[GameController] Error claiming leaderboard reward:", err);
    res.status(500).json({ error: "Failed to claim reward" });
  }
};

export const getPendingRewards = async (req: Request, res: Response) => {
  const { mobileNumber } = req.query;
  if (!mobileNumber) {
    res.status(400).json({ error: "mobileNumber required" });
    return;
  }

  try {
    const games = ["sandfall", "spin", "scratch", "quiz"];
    const pending = [];

    for (const g of games) {
      const currentWeek = getWeekNumber();
      const lb = await boltic.getLeaderboard(g, currentWeek);
      if (lb.length > 0 && lb[0].mobileNumber === String(mobileNumber)) {
        pending.push({
          gameName: g,
          reason: "Rank #1 Champion",
          claimable: true,
        });
      }
    }

    res.json(pending);
  } catch (err: any) {
    console.error("[GameController] Error getting pending rewards:", err);
    res.status(500).json({ error: "Failed to get pending rewards" });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const currentWeek = getWeekNumber();
    const leaderboard = await boltic.getLeaderboard(gameName, currentWeek);
    res.json(leaderboard);
  } catch (err: any) {
    console.error("[GameController] Error getting leaderboard:", err);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
};
