# SSN Test Account Setup Summary

## ✅ Setup Complete!

Successfully created test data for SSN's account (7619665096, username: ssn).

---

## 📊 What Was Created

### 🎁 Test Coupons (30 Total)

SSN now has **30 unredeemed coupons** across different tiers:

#### From Latest Setup Run:

- **2× GRAND** (50%, 40% off)
- **3× PREMIUM** (30%, 25%, 20% off)
- **2× STANDARD** (15%, 12% off)
- **3× BASIC** (10%, 8%, 5% off)

#### From Previous Runs:

- **3× LEGENDARY** (75% off - from leaderboard wins)
- **6× PREMIUM** (25%, 20% off)
- **3× STANDARD** (15% off)
- **5× BASIC** (10%, 8%, 5% off)
- **3× GRAND** (30% off)

All coupons expire: **January 11, 2026**

---

### 🏆 Leaderboard Positions (Week 50)

SSN is ranked **#1** on all game leaderboards:

| Game     | SSN's Score | Status |
| -------- | ----------- | ------ |
| Quiz     | 1,094 pts   | 🥇 #1  |
| Scratch  | 5,053 pts   | 🥇 #1  |
| Spin     | 3,073 pts   | 🥇 #1  |
| Sandfall | 10,040 pts  | 🥇 #1  |

---

### 👥 Mock Users Created

10 users total (including SSN) for realistic leaderboards:

| Mobile     | Username      | Role          |
| ---------- | ------------- | ------------- |
| 7619665096 | ssn           | ⭐ Top player |
| 9876543210 | player_one    | Competitor    |
| 9123456780 | gamer_pro     | Competitor    |
| 8765432109 | quiz_master   | Competitor    |
| 7890123456 | scratch_king  | Competitor    |
| 9988776655 | wheel_spinner | Competitor    |
| 8877665544 | sand_ninja    | Competitor    |
| 7766554433 | lucky_star    | Competitor    |
| 9988112233 | game_champ    | Competitor    |
| 8899223344 | score_hunter  | Competitor    |

---

## 🎮 Testing the Account

### Login

```bash
Mobile: 7619665096
OTP: (request via API)
Username: ssn
```

### View Coupons

```bash
curl http://localhost:3000/api/user/7619665096/rewards
```

### View Leaderboard

```bash
curl http://localhost:3000/api/games/quiz/leaderboard?week=50
curl http://localhost:3000/api/games/scratch/leaderboard?week=50
curl http://localhost:3000/api/games/spin/leaderboard?week=50
curl http://localhost:3000/api/games/sandfall/leaderboard?week=50
```

---

## 🔄 Re-running Scripts

If you need to add more data or reset:

### Add More Coupons Only

```bash
pnpm tsx src/scripts/add-test-coupons-ssn.ts
```

### Populate Leaderboard Only

```bash
pnpm tsx src/scripts/populate-leaderboard.ts
```

### Complete Reset & Setup

```bash
pnpm tsx src/scripts/setup-ssn-test-account.ts
```

---

## 📝 Notes

- All coupons are valid for 30 days from creation
- Leaderboard uses ISO week number (currently week 50)
- SSN has the highest score on every game
- Mock users have randomized scores below SSN
- Timestamps are staggered for realistic ordering

---

## 🎉 Ready for Testing!

SSN's account is now fully set up with:

- ✅ 30 test coupons (various tiers)
- ✅ #1 position on all leaderboards
- ✅ 9 other users for competitive context
- ✅ All user data properly created in database

Happy testing! 🚀
