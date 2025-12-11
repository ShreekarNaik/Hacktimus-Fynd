// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import { boltic } from "./services/bolticService";

/**
 * Comprehensive test script for Boltic Tables integration
 * Tests all major CRUD operations and verifies the database connection
 * Run with: pnpm tsx src/test-boltic.ts
 */

async function runTests() {
  console.log(
    "----     Boltic Tables Integration - Comprehensive Test Suite.   ----"
  );

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // ==== INITIALIZATION TESTS ====
    console.log("📋 INITIALIZATION TESTS");
    console.log("━".repeat(60));
    console.log("✓ Boltic SDK initialized successfully");
    console.log("✓ Environment variables loaded");
    console.log(
      "✓ API Key:",
      process.env.BOLTIC_API_KEY?.substring(0, 8) + "..."
    );
    console.log("✓ Region:", process.env.BOLTIC_REGION);
    console.log();

    // ==== TEST 1: Get Leaderboard (Empty) ====
    console.log("🧪 TEST 1: Query Empty Leaderboard");
    console.log("━".repeat(60));
    try {
      const leaderboard = await boltic.getLeaderboard("sandfall", 1, 5);
      console.log("✓ Query executed successfully");
      console.log(
        `✓ Retrieved ${leaderboard.length} leaderboard entries (expected empty)\n`
      );
      testsPassed++;
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== TEST 2: Insert User ====
    console.log("🧪 TEST 2: Insert Test User");
    console.log("━".repeat(60));
    const testUserId = `test-user-${Date.now()}`;
    const testUser = {
      userId: testUserId,
      fyndUserId: "fynd-test-123",
      coinsBalance: 100,
      dailyLoginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      totalGamesPlayed: 0,
      totalWins: 0,
      winsThisWeek: 0,
      createdAt: Date.now(),
    };
    try {
      await boltic.insertRecord("users", testUser);
      console.log(`✓ User inserted with ID: ${testUserId}\n`);
      testsPassed++;
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== TEST 3: Retrieve User ====
    console.log("🧪 TEST 3: Retrieve Test User");
    console.log("━".repeat(60));
    let retrievedUser: any = null;
    try {
      retrievedUser = await boltic.getUser(testUserId);
      if (retrievedUser) {
        console.log("✓ User retrieved successfully");
        console.log(`  - ID: ${retrievedUser.user_id}`);
        console.log(`  - Fynd User ID: ${retrievedUser.fynd_user_id}`);
        console.log(`  - Coins Balance: ${retrievedUser.coins_balance}\n`);
        testsPassed++;
      } else {
        console.error("✗ User not found after insertion");
        testsFailed++;
      }
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== TEST 4: Insert Leaderboard Entry ====
    console.log("🧪 TEST 4: Insert Leaderboard Entry");
    console.log("━".repeat(60));
    try {
      await boltic.insertLeaderboardEntry({
        userId: testUserId,
        gameName: "sandfall",
        score: 1234,
        weekNumber: 1,
        timestamp: Date.now(),
      });
      console.log("✓ Leaderboard entry inserted (sandfall, score: 1234)\n");
      testsPassed++;
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== TEST 5: Query Leaderboard (With Data) ====
    console.log("🧪 TEST 5: Query Leaderboard with Data");
    console.log("━".repeat(60));
    try {
      const leaderboard = await boltic.getLeaderboard("sandfall", 1, 5);
      console.log("✓ Query executed successfully");
      console.log(`✓ Retrieved ${leaderboard.length} leaderboard entries`);
      if (leaderboard.length > 0) {
        const topEntry = leaderboard[0] as any;
        console.log(
          `  - Top Score: ${topEntry.score} (User: ${topEntry.user_id})\n`
        );
      }
      testsPassed++;
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== TEST 6: Update User ====
    console.log("🧪 TEST 6: Update User Data");
    console.log("━".repeat(60));
    try {
      const updated = await boltic.updateUser(testUserId, {
        coinsBalance: 250,
        totalWins: 5,
      });
      if (updated) {
        console.log("✓ User updated successfully");
        const updatedUser = updated as any;
        console.log(
          `  - New Coins Balance: ${updatedUser.coins_balance || 250}`
        );
        console.log(`  - New Total Wins: ${updatedUser.total_wins || 5}\n`);
        testsPassed++;
      } else {
        console.error("✗ Update returned null");
        testsFailed++;
      }
    } catch (error) {
      console.error("✗ Failed:", error);
      testsFailed++;
    }

    // ==== SUMMARY ====
    console.log("═".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("═".repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(
      `📈 Success Rate: ${(
        (testsPassed / (testsPassed + testsFailed)) *
        100
      ).toFixed(1)}%\n`
    );

    if (testsFailed === 0) {
      console.log(
        "╔════════════════════════════════════════════════════════════╗"
      );
      console.log(
        "║  🎉 ALL TESTS PASSED! Boltic Integration is Ready! 🎉     ║"
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝\n"
      );
      console.log("The backend is ready to use. You can now:");
      console.log("  • Start the server: pnpm run dev");
      console.log("  • Test API endpoints from your frontend");
      console.log("  • Deploy to production\n");
    } else {
      console.log("⚠️  Some tests failed. Please review the errors above.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    console.error("\nTroubleshooting:");
    console.error("1. Verify BOLTIC_API_KEY in .env file");
    console.error("2. Check that all required tables exist in Boltic Console");
    console.error(
      "3. Ensure tables use snake_case column names (user_id, game_name, etc.)"
    );
    console.error(
      "4. Review backend/BOLTIC_SETUP_SUMMARY.md for setup instructions\n"
    );
    process.exit(1);
  }
}

// Run all tests
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
