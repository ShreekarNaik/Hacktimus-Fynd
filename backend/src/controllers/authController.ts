import { Request, Response } from "express";
import { boltic } from "../services/bolticService";
import { generateOtp, verifyOtp } from "../services/otpStore";
import * as fyndApi from "../services/fyndApi";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Track Fynd request_ids per phone so we can verify without changing the client payload shape too much.
const fyndOtpRequests: Record<
  string,
  { requestId: string; resendToken?: string }
> = {};

// OTP flow - used by frontend for phone based auth and delete confirmation
export const sendOtp = async (req: Request, res: Response) => {
  const { phoneNumber, mobileNumber } = req.body;
  const identifier = phoneNumber || mobileNumber;

  if (!identifier) {
    res.status(400).json({ error: "phoneNumber or mobileNumber is required" });
    return;
  }

  try {
    const data = await fyndApi.sendOtp(identifier);

    if (data?.request_id) {
      fyndOtpRequests[identifier] = {
        requestId: data.request_id,
        resendToken: data.resend_token,
      };
    }

    res.json({
      success: true,
      message: "OTP sent via Fynd",
      requestId: data?.request_id,
      resendToken: data?.resend_token,
    });
  } catch (err: any) {
    console.error(
      "[Auth] Fynd sendOtp failed:",
      err?.response?.data || err?.message || err
    );
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const registerWithOtp = async (req: Request, res: Response) => {
  const { phoneNumber, username, otp, requestId } = req.body;

  if (!phoneNumber || !username || !otp) {
    res
      .status(400)
      .json({ error: "phoneNumber, username and otp are required" });
    return;
  }

  try {
    // Verify OTP with Fynd
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

    // Check if user already exists in Boltic
    const existingUser = await boltic.getUser(phoneNumber);

    if (existingUser) {
      res.status(400).json({ error: "Phone number already registered" });
      return;
    }

    // Check if username is unique
    const usernameExists = await boltic.isUsernameExists(username);
    if (usernameExists) {
      res.status(400).json({
        error: "Username already taken. Please choose a different one.",
      });
      return;
    }

    // Create new user
    const user = {
      mobileNumber: phoneNumber,
      username: username,
      coinsBalance: 100, // Welcome bonus
      dailyLoginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 0,
      totalWins: 0,
      winsThisWeek: 0,
      createdAt: Date.now(),
    };

    await boltic.insertRecord("users", user);

    // Generate JWT token
    const token = jwt.sign({ mobileNumber: phoneNumber }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user,
    });
  } catch (err: any) {
    const errorDetail =
      err?.response?.data?.error || err?.response?.data || err?.message || err;
    console.error("[Auth] Registration failed:", errorDetail);
    res.status(400).json({ error: errorDetail || "Registration failed" });
  }
};

export const loginWithOtp = async (req: Request, res: Response) => {
  const { phoneNumber, otp, requestId } = req.body;

  if (!phoneNumber || !otp) {
    res.status(400).json({ error: "phoneNumber and otp are required" });
    return;
  }

  try {
    // Verify OTP with Fynd
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

    // Get user from Boltic
    const user = await boltic.getUser(phoneNumber);

    if (!user) {
      res.status(404).json({ error: "User not found. Please Sign Up." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ mobileNumber: phoneNumber }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user,
    });
  } catch (err: any) {
    console.error(
      "[Auth] Login failed:",
      err?.response?.data || err?.message || err
    );
    res.status(400).json({ error: "Login failed" });
  }
};

export const checkUsernameAvailability = async (
  req: Request,
  res: Response
) => {
  const { username } = req.query;

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const exists = await boltic.isUsernameExists(username);
    res.json({
      available: !exists,
      message: exists ? "Username is already taken" : "Username is available",
    });
  } catch (err: any) {
    console.error("[Auth] Username check failed:", err);
    res.status(500).json({ error: "Failed to check username availability" });
  }
};
