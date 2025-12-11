import { Request, Response } from "express";
import { db } from "../services/mock/db";
import { boltic } from "../services/bolticService";
import { generateOtp, verifyOtp } from "../services/otpStore";
import { phoneToUserId } from "../services/mock/phoneMap";
import * as fyndApi from "../services/fyndApi";

// Track Fynd request_ids per phone so we can verify without changing the client payload shape too much.
const fyndOtpRequests: Record<
  string,
  { requestId: string; resendToken?: string }
> = {};

export const login = async (req: Request, res: Response) => {
  // Mock Login - in real world this accepts OAuth code
  const { userId = "test-user", password } = req.body;

  // Basic Password Check (Mock)
  // If user exists, check 'password'. In real app, we check hashed password.
  // We'll store a mock password map in memory for this demo or just hardcode "pass123" for safety

  if (!userId) {
    res.status(400).json({ error: "User ID required" });
    return;
  }

  if (password !== "pass123") {
    res.status(401).json({ error: "Invalid Password" });
    return;
  }

  // Ensure user exists in mock DB
  if (!db.users[userId]) {
    db.users[userId] = {
      userId,
      fyndUserId: `fynd-${userId}`,
      coinsBalance: 100, // Welcome bonus
      dailyLoginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 0,
      totalWins: 0,
      winsThisWeek: 0,
      createdAt: Date.now(),
    };
  }

  // Return "token" (just userId for mock)
  res.json({
    token: `mock-jwt-${userId}`,
    user: db.users[userId],
  });
};

// OTP flow - used by frontend for phone based auth and delete confirmation
export const sendOtp = async (req: Request, res: Response) => {
  const { phoneNumber, userId } = req.body;
  const derivedPhone = phoneNumber || (userId && db.users[userId]?.phoneNumber);
  const identifier = derivedPhone || userId;

  if (!identifier) {
    res.status(400).json({ error: "phoneNumber or userId is required" });
    return;
  }

  const useFynd = process.env.USE_FYND_API === "true";

  try {
    if (useFynd) {
      if (!derivedPhone) {
        res.status(400).json({ error: "phoneNumber is required for Fynd OTP" });
        return;
      }

      const data = await fyndApi.sendOtp(derivedPhone as string);

      if (data?.request_id) {
        fyndOtpRequests[derivedPhone] = {
          requestId: data.request_id,
          resendToken: data.resend_token,
        };
      }

      res.json({
        success: true,
        message: "OTP sent via Fynd",
        requestId: data?.request_id,
        resendToken: data?.resend_token,
        data,
      });
      return;
    }
  } catch (err: any) {
    console.error(
      "[Auth] Fynd sendOtp failed, falling back to in-memory OTP",
      err?.response?.data || err?.message || err
    );
  }

  const code = generateOtp(identifier);
  console.log(`[OTP] Generated OTP for ${identifier}: ${code}`);

  // NEVER send OTP to frontend - it is only for backend use
  res.json({ success: true, message: "OTP sent successfully" });
};

export const registerWithOtp = async (req: Request, res: Response) => {
  const { phoneNumber, username, otp, requestId } = req.body;

  if (!phoneNumber || !username || !otp) {
    res
      .status(400)
      .json({ error: "phoneNumber, username and otp are required" });
    return;
  }

  const useFynd = process.env.USE_FYND_API === "true";

  if (useFynd) {
    try {
      const mappedRequestId =
        requestId || fyndOtpRequests[phoneNumber]?.requestId;
      if (!mappedRequestId) {
        res
          .status(400)
          .json({ error: "requestId is required for Fynd OTP verification" });
        return;
      }

      await fyndApi.verifyOtp(otp, mappedRequestId);
      delete fyndOtpRequests[phoneNumber];
    } catch (err: any) {
      console.error(
        "[Auth] Fynd verifyOtp failed",
        err?.response?.data || err?.message || err
      );
      res.status(400).json({ error: "Invalid or expired OTP (Fynd)" });
      return;
    }
  } else if (!verifyOtp(phoneNumber, otp)) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  if (db.users[username]) {
    res.status(400).json({ error: "Username taken, please choose another" });
    return;
  }

  const user = {
    userId: username,
    fyndUserId: `fynd-${username}`,
    coinsBalance: 0,
    dailyLoginStreak: 1,
    lastLoginDate: new Date().toISOString(),
    totalGamesPlayed: 0,
    totalWins: 0,
    winsThisWeek: 0,
    createdAt: Date.now(),
    phoneNumber,
  } as any;

  db.users[username] = user;
  phoneToUserId[phoneNumber] = username;

  try {
    await boltic.insertRecord("users", user);
  } catch (err) {
    console.warn("[Auth] Failed to sync user to Boltic:", err);
  }

  res.json({
    token: `mock-jwt-${username}`,
    user,
  });
};

export const loginWithOtp = async (req: Request, res: Response) => {
  const { phoneNumber, otp, requestId } = req.body;

  if (!phoneNumber || !otp) {
    res.status(400).json({ error: "phoneNumber and otp are required" });
    return;
  }

  const useFynd = process.env.USE_FYND_API === "true";

  if (useFynd) {
    try {
      const mappedRequestId =
        requestId || fyndOtpRequests[phoneNumber]?.requestId;
      if (!mappedRequestId) {
        res
          .status(400)
          .json({ error: "requestId is required for Fynd OTP verification" });
        return;
      }

      await fyndApi.verifyOtp(otp, mappedRequestId);
      delete fyndOtpRequests[phoneNumber];
    } catch (err: any) {
      console.error(
        "[Auth] Fynd verifyOtp failed",
        err?.response?.data || err?.message || err
      );
      res.status(400).json({ error: "Invalid or expired OTP (Fynd)" });
      return;
    }
  } else if (!verifyOtp(phoneNumber, otp)) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  const mappedUserId = phoneToUserId[phoneNumber];
  const user = mappedUserId ? db.users[mappedUserId] : undefined;

  if (!user) {
    res.status(404).json({ error: "User not found. Please Sign Up." });
    return;
  }

  res.json({
    token: `mock-jwt-${user.userId}`,
    user,
  });
};
