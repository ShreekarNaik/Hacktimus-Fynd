import { Request, Response } from "express";
import { db } from "../services/mock/db";
import { boltic } from "../services/bolticService";
import { verifyOtp } from "../services/otpStore";
import { phoneToUserId } from "../services/mock/phoneMap";

export const getUserProfile = async (req: Request, res: Response) => {
  const userId = (req.params.userId || req.query.userId) as string;
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const user = db.users[userId];

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Fetch User Rewards
  const userRewards = Object.values(db.rewards).filter(
    (r) => r.userId === userId
  );

  res.json({
    ...user,
    rewards: userRewards,
  });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { userId, currentUserId, preferredStores, displayName } = req.body;
  const sourceUserId = currentUserId || userId;

  if (!sourceUserId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  const user = db.users[sourceUserId];
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const targetUserId = userId || sourceUserId;
  if (targetUserId !== sourceUserId && db.users[targetUserId]) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  if (preferredStores) {
    (user as any).preferredStores = preferredStores;
  }
  if (displayName) {
    (user as any).displayName = displayName;
  }

  if (targetUserId !== sourceUserId) {
    delete db.users[sourceUserId];
    user.userId = targetUserId;
    db.users[targetUserId] = user;

    Object.keys(phoneToUserId).forEach((phone) => {
      if (phoneToUserId[phone] === sourceUserId) {
        phoneToUserId[phone] = targetUserId;
      }
    });
  }

  try {
    await boltic.updateUser(user.userId, user);
  } catch (err) {
    console.warn("[User] Failed to sync update to Boltic:", err);
  }

  res.json({ success: true, user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    res.status(400).json({ error: "userId and otp are required" });
    return;
  }

  if (!verifyOtp(userId, otp)) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  if (!db.users[userId]) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  delete db.users[userId];
  Object.keys(phoneToUserId).forEach((phone) => {
    if (phoneToUserId[phone] === userId) {
      delete phoneToUserId[phone];
    }
  });

  res.json({ success: true });
};
