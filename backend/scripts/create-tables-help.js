#!/usr/bin/env node

/**
 * Helper script to display table creation instructions for Boltic Console
 * Run with: node scripts/create-tables-help.js
 */

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║     Boltic Tables Creation Guide                              ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('🌐 Open Boltic Console:');
console.log('   https://asia-south1.console.boltic.io/\n');

console.log('📋 Steps:');
console.log('   1. Click "Tables" in the sidebar');
console.log('   2. Click "Create Table"');
console.log('   3. Click "Start with prompts"');
console.log('   4. Copy-paste each prompt below\n');

const tables = [
  {
    name: 'users',
    prompt: 'Create a table named users with columns: userId (text, primary key), fyndUserId (text), coinsBalance (number), dailyLoginStreak (number), lastLoginDate (text), totalGamesPlayed (number), totalWins (number), winsThisWeek (number), createdAt (bigint).'
  },
  {
    name: 'game_sessions',
    prompt: 'Create a table named game_sessions with columns: sessionId (text, primary key), userId (text), gameName (text), score (number), coinsEarned (number), rewardTier (text, nullable), completedAt (bigint), isCartRecovery (boolean), cartId (text, nullable).'
  },
  {
    name: 'leaderboard',
    prompt: 'Create a table named leaderboard with columns: id (text, primary key), userId (text), gameName (text), score (number), weekNumber (number), timestamp (bigint).'
  },
  {
    name: 'rewards',
    prompt: 'Create a table named rewards with columns: rewardId (text, primary key), userId (text), rewardType (text), rewardTier (text), discountPercentage (number), couponCode (text), expiryDate (bigint), redeemed (boolean), distributedAt (bigint).'
  },
  {
    name: 'cart_abandonments',
    prompt: 'Create a table named cart_abandonments with columns: cartId (text, primary key), userId (text), items (json), cartValue (number), createdAt (bigint), notificationSent (boolean), gameLink (text, nullable), converted (boolean).'
  }
];

tables.forEach((table, index) => {
  console.log(`\n${index + 1}. Table: ${table.name}`);
  console.log('─'.repeat(70));
  console.log(table.prompt);
});

console.log('\n\n⚠️  Important Notes:');
console.log('   • Use camelCase for column names (userId, not user_id)');
console.log('   • Mark first column as Primary Key');
console.log('   • Use BigInt/Number for timestamps');
console.log('   • Mark nullable fields correctly\n');

console.log('✅ After creating all tables, run:');
console.log('   pnpm tsx src/test-boltic.ts\n');

