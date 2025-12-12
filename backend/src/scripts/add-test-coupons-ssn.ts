// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "../services/bolticService";
import { Reward } from "../models/types";

/**
 * Script to add diverse test coupons for SSN
 * Run with: pnpm tsx src/scripts/add-test-coupons-ssn.ts
 */

async function generateCouponCode(prefix: string): Promise<string> {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
}

async function addTestCouponsForSSN() {
  const mobileNumber = "7619665096";

  try {
    console.log(`\n🎁 Adding Test Coupons for SSN (${mobileNumber})`);
    console.log("━".repeat(60));

    // Diverse coupon configurations
    const coupons = [
      {
        rewardType: "DISCOUNT",
        rewardTier: "GRAND",
        discountPercentage: 50,
        couponPrefix: "GRAND50",
        description: "Grand Prize - 50% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "GRAND",
        discountPercentage: 40,
        couponPrefix: "GRAND40",
        description: "Grand Prize - 40% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "PREMIUM",
        discountPercentage: 30,
        couponPrefix: "PREMIUM30",
        description: "Premium - 30% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "PREMIUM",
        discountPercentage: 25,
        couponPrefix: "PREMIUM25",
        description: "Premium - 25% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "PREMIUM",
        discountPercentage: 20,
        couponPrefix: "PREMIUM20",
        description: "Premium - 20% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "STANDARD",
        discountPercentage: 15,
        couponPrefix: "STANDARD15",
        description: "Standard - 15% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "STANDARD",
        discountPercentage: 12,
        couponPrefix: "STANDARD12",
        description: "Standard - 12% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "BASIC",
        discountPercentage: 10,
        couponPrefix: "BASIC10",
        description: "Basic - 10% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "BASIC",
        discountPercentage: 8,
        couponPrefix: "BASIC8",
        description: "Basic - 8% off",
      },
      {
        rewardType: "DISCOUNT",
        rewardTier: "BASIC",
        discountPercentage: 5,
        couponPrefix: "BASIC5",
        description: "Basic - 5% off",
      },
    ];

    const now = Date.now();
    const validityMs = 30 * 24 * 60 * 60 * 1000; // 30 days

    console.log(`\n📦 Creating ${coupons.length} test coupons...\n`);

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
        console.log(`✓ ${couponData.description.padEnd(30)}`);
        console.log(`  Code: ${inserted.couponCode}`);
        console.log(
          `  Tier: ${inserted.rewardTier.padEnd(10)} | Expires: ${new Date(
            inserted.expiryDate
          ).toLocaleDateString()}\n`
        );
      } catch (error) {
        console.error(`✗ Failed to add ${couponData.description}:`, error);
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Verify the coupons were added
    console.log("━".repeat(60));
    console.log("📋 Verifying added coupons...\n");
    const rewards = await boltic.getUserRewards(mobileNumber, false);

    console.log(`✓ Total unredeemed coupons: ${rewards.length}\n`);

    // Group by tier
    const byTier: Record<string, number> = {};
    rewards.forEach((reward) => {
      byTier[reward.rewardTier] = (byTier[reward.rewardTier] || 0) + 1;
    });

    console.log("📊 Coupons by Tier:");
    Object.entries(byTier)
      .sort(([a], [b]) => {
        const order = ["GRAND", "PREMIUM", "STANDARD", "BASIC"];
        return order.indexOf(a) - order.indexOf(b);
      })
      .forEach(([tier, count]) => {
        console.log(
          `  ${tier.padEnd(10)}: ${count} coupon${count !== 1 ? "s" : ""}`
        );
      });

    console.log("\n✅ All test coupons successfully added for SSN!");
  } catch (error) {
    console.error("❌ Error adding test coupons:", error);
    process.exit(1);
  }
}

// Run the script
addTestCouponsForSSN().then(() => {
  process.exit(0);
});
