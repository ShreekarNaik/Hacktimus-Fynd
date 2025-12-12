# Test Data Scripts

This directory contains scripts for populating test data in the database.

## Available Scripts

### 1. `setup-ssn-test-account.ts` (Recommended - All-in-One)

**Master script that sets up everything for SSN's test account in one go.**

```bash
pnpm tsx src/scripts/setup-ssn-test-account.ts
```

**What it does:**

- ✅ Creates/verifies SSN user (7619665096, username: ssn)
- ✅ Adds 10 diverse test coupons (GRAND, PREMIUM, STANDARD, BASIC tiers)
- ✅ Populates leaderboards for all games with SSN at #1
- ✅ Creates 9 additional mock users for realistic leaderboards
- ✅ Verifies all data was created successfully

**Coupons Created:**

- 2× GRAND tier (50%, 40% off)
- 3× PREMIUM tier (30%, 25%, 20% off)
- 2× STANDARD tier (15%, 12% off)
- 3× BASIC tier (10%, 8%, 5% off)

**Games Populated:**

- quiz (SSN: 1000 pts)
- scratch (SSN: 5000 pts)
- spin (SSN: 3000 pts)
- sandfall (SSN: 10000 pts)

---

### 2. `add-test-coupons-ssn.ts`

**Adds only test coupons for SSN.**

```bash
pnpm tsx src/scripts/add-test-coupons-ssn.ts
```

Use this if you only want to add coupons without touching leaderboards.

---

### 3. `populate-leaderboard.ts`

**Populates leaderboards with mock data.**

```bash
pnpm tsx src/scripts/populate-leaderboard.ts
```

Use this if you only want to populate leaderboards without adding coupons.

**Creates:**

- 10 mock users (including SSN)
- Leaderboard entries for all 4 games
- SSN placed at #1 on all leaderboards

---

### 4. `add-coupons.ts`

**Original script - adds coupons for any user.**

```bash
pnpm tsx src/scripts/add-coupons.ts [mobile-number]
```

Default: 7619665096 (SSN)

**Example:**

```bash
pnpm tsx src/scripts/add-coupons.ts 9876543210
```

---

## Mock Users Created

| Mobile     | Username      | Role            |
| ---------- | ------------- | --------------- |
| 7619665096 | ssn           | Top player      |
| 9876543210 | player_one    | Mock competitor |
| 9123456780 | gamer_pro     | Mock competitor |
| 8765432109 | quiz_master   | Mock competitor |
| 7890123456 | scratch_king  | Mock competitor |
| 9988776655 | wheel_spinner | Mock competitor |
| 8877665544 | sand_ninja    | Mock competitor |
| 7766554433 | lucky_star    | Mock competitor |
| 9988112233 | game_champ    | Mock competitor |
| 8899223344 | score_hunter  | Mock competitor |

---

## Environment Requirements

Make sure your `.env` file has:

```env
BOLTIC_API_KEY=your_api_key
BOLTIC_REGION=asia-south1
```

---

## Quick Start (Recommended)

To set up a complete test environment for SSN:

```bash
cd backend
pnpm tsx src/scripts/setup-ssn-test-account.ts
```

This will create everything you need for testing!

---

## Troubleshooting

### "User already exists"

The scripts handle this gracefully - they will skip user creation if the user already exists.

### "Duplicate leaderboard entry"

If you run the scripts multiple times, you may get duplicate entries. Clear the leaderboard first or use a different week number.

### Rate Limiting

Scripts include 100ms delays between operations to avoid rate limiting.

---

## Notes

- All coupons have 30-day validity
- Leaderboard entries use the current ISO week number
- Timestamps are staggered to create realistic ordering
- SSN is guaranteed to be #1 on all leaderboards
