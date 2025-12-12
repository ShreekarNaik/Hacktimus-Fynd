// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "../services/bolticService";
import { LeaderboardEntry } from "../models/types";

/**
 * Script to populate leaderboard with mock entries and place ssn at the top
 * Run with: pnpm tsx src/scripts/populate-leaderboard.ts
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

const mockUsers = [
  { mobile: "7619665096", username: "ssn", topScore: true },
  { mobile: "9876543210", username: "player_one" },
  { mobile: "9123456780", username: "gamer_pro" },
  { mobile: "8765432109", username: "quiz_master" },
  { mobile: "7890123456", username: "scratch_king" },
  { mobile: "9988776655", username: "wheel_spinner" },
  { mobile: "8877665544", username: "sand_ninja" },
  { mobile: "7766554433", username: "lucky_star" },
  { mobile: "9988112233", username: "game_champ" },
  { mobile: "8899223344", username: "score_hunter" },
  { mobile: "7788334455", username: "prize_seeker" },
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
    }
  } catch (error) {
    console.error(`  Error ensuring user ${username}:`, error);
  }
}

async function populateLeaderboard() {
  try {
    console.log("\n🎮 Populating Leaderboard with Mock Data");
    console.log("━".repeat(60));

    const currentWeek = getWeekNumber();
    console.log(`Current Week Number: ${currentWeek}\n`);

    // Ensure all users exist
    console.log("👥 Ensuring users exist...");
    for (const user of mockUsers) {
      await ensureUserExists(user.mobile, user.username);
    }
    console.log("✓ All users created/verified\n");

    // Create leaderboard entries for each game
    for (const gameName of games) {
      console.log(`\n📊 Populating ${gameName} leaderboard...`);
      console.log("─".repeat(50));

      for (let i = 0; i < mockUsers.length; i++) {
        const user = mockUsers[i];
        let baseScore: number;

        // Determine score based on game type and user position
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

        // Add some variation
        const score = baseScore - i * 50 + Math.floor(Math.random() * 100);

        const entry: Omit<LeaderboardEntry, "id"> = {
          mobileNumber: user.mobile,
          username: user.username,
          gameName: gameName,
          score: score,
          weekNumber: currentWeek,
          timestamp: Date.now() - i * 60000, // Stagger timestamps
        };

        try {
          await boltic.insertLeaderboardEntry(entry);
          console.log(
            `  ✓ ${user.username.padEnd(15)} - Score: ${score
              .toString()
              .padStart(5)} in ${gameName}`
          );
        } catch (error) {
          console.error(`  ✗ Failed to add entry for ${user.username}:`, error);
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("\n━".repeat(60));
    console.log("✅ Leaderboard population complete!");
    console.log("\n📋 Verifying leaderboards...\n");

    // Verify each game's leaderboard
    for (const gameName of games) {
      const leaderboard = await boltic.getLeaderboard(gameName, currentWeek, 5);
      console.log(`\n🏆 Top 5 in ${gameName}:`);
      leaderboard.forEach((entry, idx) => {
        console.log(
          `  ${idx + 1}. ${entry.username?.padEnd(15)} - ${entry.score} points`
        );
      });
    }

    console.log("\n🎉 All done! ssn should be at the top of all leaderboards!");
  } catch (error) {
    console.error("❌ Error populating leaderboard:", error);
    process.exit(1);
  }
}

// Run the script
populateLeaderboard().then(() => {
  process.exit(0);
});
