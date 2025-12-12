// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "../services/bolticService";

/**
 * Script to verify rewards for a specific user
 * Run with: pnpm tsx src/scripts/verify-rewards.ts <mobileNumber>
 */

async function verifyRewards(mobileNumber: string) {
  try {
    console.log(`\n📦 Verifying rewards for user: ${mobileNumber}`);
    console.log("━".repeat(60));

    // Fetch user
    const user = await boltic.getUser(mobileNumber);
    if (!user) {
      console.log(
        `❌ User not found. Please ensure user exists with mobile: ${mobileNumber}`
      );
      return;
    }

    console.log(`✓ User found: ${user.username || user.mobileNumber}`);
    console.log();

    // Fetch all rewards
    const rewards = await boltic.getUserRewards(mobileNumber);
    console.log(`📋 Total rewards: ${rewards.length}`);

    if (rewards.length === 0) {
      console.log("⚠️  No rewards found for this user");
      return;
    }

    console.log("\nRewards Details:");
    console.log("━".repeat(60));
    rewards.forEach((reward, i) => {
      console.log(
        `\n${i + 1}. ${reward.rewardTier} Tier - ${reward.rewardType}`
      );
      console.log(`   Discount: ${reward.discountPercentage}%`);
      console.log(`   Code: ${reward.couponCode}`);
      console.log(`   Status: ${reward.redeemed ? "REDEEMED" : "UNREDEEMED"}`);
      console.log(
        `   Expires: ${new Date(reward.expiryDate).toLocaleDateString()} (${
          reward.expiryDate
        })`
      );
    });

    console.log("\n" + "━".repeat(60));
    const unredeemed = rewards.filter((r) => !r.redeemed).length;
    console.log(`✅ ${unredeemed} unredeemed rewards available`);
  } catch (error) {
    console.error("❌ Error verifying rewards:", error);
    process.exit(1);
  }
}

// Run the script
const mobileNumber = process.argv[2] || "7619665096";
verifyRewards(mobileNumber).then(() => {
  process.exit(0);
});
