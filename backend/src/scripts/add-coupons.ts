// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "../services/bolticService";
import { Reward } from "../models/types";

/**
 * Script to add sample coupons for a specific user
 * Run with: pnpm tsx src/scripts/add-coupons.ts
 */

async function generateCouponCode(prefix: string): Promise<string> {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
}

async function addCouponsForUser(mobileNumber: string) {
  try {
    console.log(`\n🎁 Adding coupons for user: ${mobileNumber}`);
    console.log("━".repeat(60));

    // Sample coupon data to add
    const coupons = [
      {
        rewardType: "DISCOUNT",
        rewardTier: "PREMIUM",
        discountPercentage: 20,
        couponPrefix: "PREMIUM20",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "STANDARD",
        discountPercentage: 15,
        couponPrefix: "STANDARD15",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "BASIC",
        discountPercentage: 10,
        couponPrefix: "BASIC10",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "GRAND",
        discountPercentage: 30,
        couponPrefix: "GRAND30",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "PREMIUM",
        discountPercentage: 25,
        couponPrefix: "PREMIUM25",
      },
    ];

    const now = Date.now();
    const validityMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    for (const couponData of coupons) {
      const reward: Reward = {
        rewardId: `reward-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        mobileNumber,
        rewardType: couponData.rewardType,
        rewardTier: couponData.rewardTier,
        discountPercentage: couponData.discountPercentage,
        couponCode: await generateCouponCode(couponData.couponPrefix),
        expiryDate: now + validityMs,
        redeemed: false,
        distributedAt: now,
      };

      try {
        const inserted = await boltic.insertReward(reward);
        console.log(
          `✓ Added ${couponData.rewardTier} coupon (${couponData.discountPercentage}% off)`
        );
        console.log(`  Code: ${inserted.couponCode}`);
        console.log(
          `  Expires: ${new Date(inserted.expiryDate).toLocaleDateString()}\n`
        );
      } catch (error) {
        console.error(
          `✗ Failed to add ${couponData.rewardTier} coupon:`,
          error
        );
      }
    }

    // Verify the coupons were added
    console.log("━".repeat(60));
    console.log("📋 Verifying added coupons...\n");
    const rewards = await boltic.getUserRewards(mobileNumber, false);
    console.log(`✓ Total unredeemed coupons for user: ${rewards.length}`);
    rewards.forEach((reward) => {
      console.log(
        `  - ${reward.rewardTier}: ${reward.discountPercentage}% off (${reward.couponCode})`
      );
    });

    console.log("\n✅ Coupons successfully added for user " + mobileNumber);
  } catch (error) {
    console.error("❌ Error adding coupons:", error);
    process.exit(1);
  }
}

// Run the script
const mobileNumber = process.argv[2] || "7619665096";
addCouponsForUser(mobileNumber).then(() => {
  process.exit(0);
});
