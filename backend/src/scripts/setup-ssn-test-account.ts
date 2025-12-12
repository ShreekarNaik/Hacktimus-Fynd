// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "../services/bolticService";
import { Reward, LeaderboardEntry } from "../models/types";

/**
 * Master script to set up SSN's account with test data
 * - Creates/verifies SSN user
 * - Adds diverse test coupons
 * - Populates leaderboard with SSN at the top
 *
 * Run with: pnpm tsx src/scripts/setup-ssn-test-account.ts
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

async function generateCouponCode(prefix: string): Promise<string> {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
}

const SSN_MOBILE = "7619665096";
const SSN_USERNAME = "ssn";

const mockUsers = [
  { mobile: SSN_MOBILE, username: SSN_USERNAME, topScore: true },
  { mobile: "9876543210", username: "player_one" },
  { mobile: "9123456780", username: "gamer_pro" },
  { mobile: "8765432109", username: "quiz_master" },
  { mobile: "7890123456", username: "scratch_king" },
  { mobile: "9988776655", username: "wheel_spinner" },
  { mobile: "8877665544", username: "sand_ninja" },
  { mobile: "7766554433", username: "lucky_star" },
  { mobile: "9988112233", username: "game_champ" },
  { mobile: "8899223344", username: "score_hunter" },
];

const games = ["quiz", "scratch", "spin", "sandfall"];

async function ensureUserExists(mobile: string, username: string) {
  try {
    const existing = await boltic.getUser(mobile);
    if (!existing) {
      console.log(`  Creating user: ${username} (${mobile})`);
      await boltic.insertRecord("users", {
        mobileNumber: mobile,
        username: username,
        coinsBalance: 0,
        dailyLoginStreak: 0,
        lastLoginDate: new Date().toISOString().split("T")[0],
        totalGamesPlayed: 0,
        totalWins: 0,
        winsThisWeek: 0,
        createdAt: Date.now(),
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`  Error ensuring user ${username}:`, error);
    return false;
  }
}

async function addTestCoupons() {
  console.log("\n🎁 Adding Test Coupons for SSN");
  console.log("━".repeat(60));

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

  let successCount = 0;
  for (const couponData of coupons) {
    const reward: Reward = {
      rewardId: `reward-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      mobileNumber: SSN_MOBILE,
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
        `✓ ${couponData.description.padEnd(30)} - ${inserted.couponCode}`
      );
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to add ${couponData.description}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Added ${successCount}/${coupons.length} coupons`);
}

async function populateLeaderboard() {
  console.log("\n🎮 Populating Leaderboard");
  console.log("━".repeat(60));

  const currentWeek = getWeekNumber();
  console.log(`Current Week Number: ${currentWeek}\n`);

  // Ensure all users exist
  console.log("👥 Creating mock users...");
  let newUsers = 0;
  for (const user of mockUsers) {
    const isNew = await ensureUserExists(user.mobile, user.username);
    if (isNew) newUsers++;
  }
  console.log(`✓ Created ${newUsers} new users\n`);

  // Create leaderboard entries for each game
  for (const gameName of games) {
    console.log(`\n📊 Populating ${gameName} leaderboard...`);

    for (let i = 0; i < mockUsers.length; i++) {
      const user = mockUsers[i];
      let baseScore: number;

      if (user.topScore) {
        // SSN gets top scores
        baseScore =
          gameName === "quiz"
            ? 1000
            : gameName === "scratch"
            ? 5000
            : gameName === "spin"
            ? 3000
            : 10000; // sandfall
      } else {
        // Other users get randomized lower scores
        const maxScore =
          gameName === "quiz"
            ? 950
            : gameName === "scratch"
            ? 4800
            : gameName === "spin"
            ? 2900
            : 9500;
        const minScore =
          gameName === "quiz"
            ? 500
            : gameName === "scratch"
            ? 2000
            : gameName === "spin"
            ? 1000
            : 5000;

        baseScore = Math.floor(
          Math.random() * (maxScore - minScore) + minScore
        );
      }

      const score = baseScore - i * 50 + Math.floor(Math.random() * 100);

      const entry: Omit<LeaderboardEntry, "id"> = {
        mobileNumber: user.mobile,
        username: user.username,
        gameName: gameName,
        score: score,
        weekNumber: currentWeek,
        timestamp: Date.now() - i * 60000,
      };

      try {
        await boltic.insertLeaderboardEntry(entry);
        const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
        console.log(
          `  ${rank} ${user.username.padEnd(15)} - ${score
            .toString()
            .padStart(5)} pts`
        );
      } catch (error) {
        console.error(`  ✗ Failed for ${user.username}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log("\n✅ Leaderboard populated");
}

async function verifySetup() {
  console.log("\n🔍 Verifying Setup");
  console.log("━".repeat(60));

  // Verify user
  const user = await boltic.getUser(SSN_MOBILE);
  if (user) {
    console.log(`✓ User: ${user.username} (${user.mobileNumber})`);
    console.log(
      `  Coins: ${user.coinsBalance} | Games Played: ${user.totalGamesPlayed}`
    );
  }

  // Verify coupons
  const rewards = await boltic.getUserRewards(SSN_MOBILE, false);
  console.log(`\n✓ Total Coupons: ${rewards.length}`);

  const byTier: Record<string, number> = {};
  rewards.forEach((reward) => {
    byTier[reward.rewardTier] = (byTier[reward.rewardTier] || 0) + 1;
  });

  console.log("\n📊 Coupons by Tier:");
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

  // Verify leaderboard positions
  const currentWeek = getWeekNumber();
  console.log("\n🏆 Leaderboard Positions:");
  for (const gameName of games) {
    const leaderboard = await boltic.getLeaderboard(gameName, currentWeek, 3);
    const ssnEntry = leaderboard.find((e) => e.mobileNumber === SSN_MOBILE);
    if (ssnEntry) {
      const rank = leaderboard.indexOf(ssnEntry) + 1;
      const medal =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
      console.log(
        `  ${gameName.padEnd(10)} ${medal} - ${ssnEntry.score} points`
      );
    }
  }
}

async function setupSSNTestAccount() {
  try {
    console.log("\n");
    console.log("═".repeat(60));
    console.log("  🚀 SSN Test Account Setup");
    console.log("═".repeat(60));
    console.log(`  Mobile: ${SSN_MOBILE}`);
    console.log(`  Username: ${SSN_USERNAME}`);
    console.log("═".repeat(60));

    // Step 1: Add test coupons
    await addTestCoupons();

    // Step 2: Populate leaderboard
    await populateLeaderboard();

    // Step 3: Verify everything
    await verifySetup();

    console.log("\n");
    console.log("═".repeat(60));
    console.log("  🎉 Setup Complete!");
    console.log("═".repeat(60));
    console.log("\n  SSN's account is now ready for testing with:");
    console.log("  • 10 test coupons (GRAND, PREMIUM, STANDARD, BASIC)");
    console.log("  • Top positions on all game leaderboards");
    console.log("  • 9 other mock users for realistic leaderboards");
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run the script
setupSSNTestAccount().then(() => {
  process.exit(0);
});
