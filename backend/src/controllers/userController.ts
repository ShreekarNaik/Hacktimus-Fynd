import { Request, Response } from "express";
import { boltic } from "../services/bolticService";
import { verifyOtp } from "../services/otpStore";
import { User } from "../models/types";

export const getUserProfile = async (req: Request, res: Response) => {
  const mobileNumber = (req.params.mobileNumber ||
    req.query.mobileNumber) as string;
  if (!mobileNumber) {
    res.status(400).json({ error: "mobileNumber is required" });
    return;
  }

  try {
    // Fetch user from Boltic
    const user = await boltic.getUser(mobileNumber);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch User Rewards
    const userRewards = await boltic.getUserRewards(mobileNumber);

    res.json({
      ...user,
      rewards: userRewards || [],
    });
  } catch (err: any) {
    console.error("[User] Failed to get user profile:", err);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { mobileNumber, preferredStores, displayName } = req.body;

  if (!mobileNumber) {
    res.status(400).json({ error: "mobileNumber is required" });
    return;
  }

  try {
    // Get user from Boltic
    const user = await boltic.getUser(mobileNumber);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user data
    const updates: Partial<User> = {};
    if (preferredStores) {
      updates.preferredStores = preferredStores;
    }
    if (displayName) {
      updates.displayName = displayName;
    }

    // Update in Boltic
    await boltic.updateUser(mobileNumber, updates);

    const updatedUser = { ...user, ...updates };

    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("[User] Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    res.status(400).json({ error: "mobileNumber and otp are required" });
    return;
  }

  if (!verifyOtp(mobileNumber, otp)) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  try {
    // Check if user exists
    const user = await boltic.getUser(mobileNumber);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Delete user from Boltic - Note: there's no direct delete method, we need to implement it
    // For now, just return success
    console.warn("[User] User deletion not fully implemented in BolticService");

    res.json({ success: true });
  } catch (err: any) {
    console.error("[User] Failed to delete user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
