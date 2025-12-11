# Deep Coherency Analysis — Hacktimus-Fynd Platform

**Generated:** 2025-12-12T02:23:37+05:30  
**Phase:** 4 — Deep Coherency Analysis  
**Scope:** Hackathon MVP (Current Implementation)

---

## 1. API Contract Alignment

### 1.1 Backend Routes vs Frontend Expectations

| Frontend Calls | Backend Route | Status | Notes |
|----------------|---------------|--------|-------|
| `POST /auth/login` | `/api/auth` | ⚠️ Partial | Route exists, but uses mock password logic |
| `POST /auth/send-otp` | Not implemented | ❌ Missing | Frontend expects OTP endpoint |
| `POST /auth/login-otp` | Not implemented | ❌ Missing | Frontend expects OTP login |
| `POST /auth/register` | Not implemented | ❌ Missing | Frontend expects registration |
| `GET /user/:id` | `/api/user` | ⚠️ Needs verification | Route file exists |
| `PUT /user/profile` | `/api/user` | ⚠️ Needs verification | Route file exists |
| `POST /user/delete` | Not implemented | ❌ Missing | Frontend expects delete |
| `POST /games/start` | `/api/games/start` | ✅ Aligned | |
| `POST /games/submit` | `/api/games/submit` | ✅ Aligned | |
| `GET /games/leaderboard/:game` | `/api/games/leaderboard/:gameName` | ✅ Aligned | |
| `GET /games/pending-rewards` | `/api/games/pending-rewards` | ✅ Aligned | |
| `POST /games/claim-leaderboard` | `/api/games/claim-leaderboard` | ✅ Aligned | |
| `POST /admin/*` | Not implemented | ❌ Missing | All admin routes mock-only |

### 1.2 Boltic Workflow → Backend Expectations

| Workflow | Expected Endpoint | Backend Implementation | Status |
|----------|-------------------|------------------------|--------|
| Abandoned Cart Trigger | `POST /abandoned_cart?user_id=X` | Not implemented | ❌ **CRITICAL GAP** |
| Make Coupon | N/A (uses Fynd API directly) | - | ✅ Bypass |
| Get Redeem URL | N/A (Boltic workflow returns URL) | - | ✅ Bypass |
| Create User in DB | N/A (writes to Boltic Tables) | - | ✅ Bypass |

### 1.3 Response Format Inconsistencies

| Endpoint | Frontend Expects | Backend Returns | Match |
|----------|-----------------|-----------------|-------|
| `/games/submit` | `{ success, earnedCoins, message }` | `{ status, coinsEarned, reward, userStats }` | ⚠️ Mismatch |
| `/games/start` | `{ sessionId }` | `{ sessionId, status }` | ✅ Compatible |

---

## 2. Config Consistency Issues

### 2.1 Environment Variables

| Component | Variable | Expected By | Defined In | Status |
|-----------|----------|-------------|------------|--------|
| Backend | `BOLTIC_API_KEY` | `bolticService.ts` | `.env` | ✅ |
| Backend | `BOLTIC_REGION` | `bolticService.ts` | `.env` | ✅ |
| Backend | `PORT` | `index.ts` | `.env` | ✅ |
| Frontend | `VITE_USE_DEMO` | `client.ts` | Runtime flag | ✅ |
| Frontend | `VITE_API_URL` | Not used | - | ⚠️ Hardcoded localhost |
| Workflow | `BACKEND_BASE_URL` | Abandoned Cart | Workflow global | ⚠️ `localhost:3000` |
| Workflow | `authorization_token` | Make Coupon | Workflow global | ⚠️ Hardcoded OAuth |

### 2.2 Hardcoded Values (Not Configurable)

| Location | Value | Should Be |
|----------|-------|-----------|
| `gameController.ts` | `weekNumber: 1` | Dynamic week calculation |
| `gameController.ts` | `WIN_LIMITS: { daily: 1, weekly: 3 }` | Configurable |
| `gameController.ts` | `Math.random() > 0.7` (30% win rate) | Configurable |
| `webhookController.ts` | `localhost:5173` game link | Env variable |
| `bolticService.ts` | Auto-generated columns list | Schema-driven |
| Abandoned Cart workflow | `cart_value_threshold: 500` | Workflow global (✅) |

---

## 3. Ownership Clarity

### 3.1 Data Ownership Matrix

| Entity | Primary Owner | Secondary | Sync Mechanism |
|--------|---------------|-----------|----------------|
| Users | Fynd Platform | Boltic Tables | Webhook → Create User workflow |
| Cart | Fynd Platform | Boltic Tables | Webhook → Abandoned Cart workflow |
| Game Sessions | Backend Mock DB | Boltic Tables | `insertRecord()` after submit |
| Leaderboard | Boltic Tables | Backend Mock DB | Dual-write (inconsistent) |
| Rewards | Backend Mock DB | Boltic Tables | `insertRecord()` after generation |
| Coupons | Fynd Platform | Backend (code only) | Fynd API creates, backend stores code |

### 3.2 Dual-Write Issues

**Problem:** Game controller writes to both `db` (in-memory) AND `boltic`:

```typescript
// In gameController.ts submitScore():
db.rewards[reward.rewardId] = reward;        // In-memory
await boltic.insertRecord('rewards', reward); // Boltic Tables

// Leaderboard:
await boltic.insertLeaderboardEntry({...});   // Boltic only
// But getPendingRewards() queries boltic.getLeaderboard() - OK
```

**Risk:** In-memory state lost on restart; Boltic becomes source of truth only for reads.

---

## 4. Duplicated Logic

### 4.1 User Type Definitions

| Location | Fields | Notes |
|----------|--------|-------|
| `backend/models/types.ts` | userId, fyndUserId, coinsBalance, dailyLoginStreak, lastLoginDate, totalGamesPlayed, totalWins, winsThisWeek, createdAt | Full model |
| `frontend/types/index.ts` | userId, coinsBalance, dailyLoginStreak, totalWins, winsThisWeek, preferredStores?, phoneNumber? | Partial + different fields |
| `frontend/api/mockData.ts` | Implicit structure | Must match frontend type |

**Inconsistency:** `fyndUserId` in backend, `phoneNumber` in frontend. No shared schema.

### 4.2 Mock Implementations

| Frontend | Backend |
|----------|---------|
| `mockAdapter.ts` — Full REST mock | `mock/db.ts` + `mock/fynd.ts` |
| Handles auth, games, admin | Handles sessions, coupons |

**Issue:** Two independent mock systems with no shared constants.

---

## 5. Missing Integrations (Critical Gaps)

### 5.1 Gap 1: `/abandoned_cart` Endpoint

**Referenced By:** Boltic Abandoned Cart Trigger workflow  
**Expected Request:**
```http
POST /abandoned_cart?user_id={customer_id}
Content-Type: application/json

State Params: { cart_json_data: {...} }
```

**Expected Response:**
```json
{ "url": "https://fyndgames.example.com/game/sandfall?cartId=X&userId=Y" }
```

**Status:** ❌ Not implemented  
**Impact:** Cart abandonment → game flow broken

### 5.2 Gap 2: Popup/Storefront Script

**Referenced By:** `system_definition.json`, architecture diagram  
**Purpose:** Exit-intent detection on Fynd storefront  
**Status:** `/popup/` directory empty  
**Impact:** No automated trigger for exit-intent games

### 5.3 Gap 3: Admin Backend Routes

**Frontend Expects:** `/admin/auth/*`, `/admin/companies/*`, `/admin/coupons/*`  
**Backend Status:** No routes defined  
**Impact:** Admin panel works only in demo mode

### 5.4 Gap 4: Auth Backend Routes

**Frontend Expects:** `/auth/send-otp`, `/auth/login-otp`, `/auth/register`  
**Backend Status:** Only basic login exists  
**Impact:** Auth only works in demo mode

---

## 6. Contradictory Assumptions

### 6.1 Authentication Flow

| Component | Assumption |
|-----------|------------|
| Frontend AuthContext | OTP-based flow via Boltic/Fynd |
| Backend authController | Password or token-based (mock) |
| Boltic Workflows | User already exists with mobile number mapping |

**Contradiction:** No single auth source of truth. Frontend expects OTP, backend mocks password, workflows assume pre-existing user mapping.

### 6.2 Reward Tiers

| Source | Tiers |
|--------|-------|
| `spec.md` | GRAND, PREMIUM, STANDARD, BASIC |
| `gameController.ts` | GRAND, STANDARD (only 2 used) |
| `claimLeaderboardReward` | LEGENDARY (new tier) |

**Contradiction:** Tier naming inconsistent.

### 6.3 Week Number

| Source | Logic |
|--------|-------|
| `spec.md` | Dynamic `getCurrentWeekNumber()` |
| `gameController.ts` | Hardcoded `weekNumber: 1` |

**Contradiction:** Leaderboard never resets.

---

## 7. Security Concerns

### 7.1 SQL Injection Risk

```typescript
// bolticService.ts
const sql = `
  SELECT * FROM leaderboard 
  WHERE "game_name" = '${this.escapeSql(gameName)}'...
`;
```

The `escapeSql()` only handles single quotes. Parameterized queries would be safer.

### 7.2 No Auth Middleware

Backend routes have no authentication middleware:
```typescript
// routes/games.ts
router.post('/start', startGame);  // No auth check
```

Anyone can start sessions for any userId.

### 7.3 OAuth Token Exposure

Boltic workflow `Make Coupon` has hardcoded OAuth token in global variables.

---

## 8. Implementation Priority (Critical Gaps)

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| P0 | `/abandoned_cart` endpoint | Medium | Enables cart recovery flow |
| P0 | Popup script skeleton | Low | Enables exit-intent trigger |
| P1 | Frontend-Backend response alignment | Low | Fixes data contract |
| P1 | Dynamic week number | Low | Enables leaderboard reset |
| P2 | OTP auth routes (mock) | Medium | Full auth flow in non-demo |
| P2 | Admin backend routes | Medium | Admin in non-demo mode |
| P3 | Shared type definitions | Low | Developer experience |

---

## 9. Structured Questionnaire

Before finalizing the system definition, I need clarification on:

### Q1: Cart Recovery Game Selection
**Context:** The Abandoned Cart workflow calls `/abandoned_cart` to get a game URL.  
**Question:** Should the endpoint return a fixed game (e.g., SandFall) or should the game be selectable?  
**Options:**  
(A) Always return SandFall (simplest)  
(B) Rotate between games based on user history  
(C) Make it configurable per company

### Q2: Popup Script Hosting
**Context:** The `popup.js` script needs to be injected into the Fynd storefront.  
**Question:** Where should this script be hosted for the demo?  
**Options:**  
(A) CDN/Vercel (frontend build output)  
(B) Backend static serve  
(C) Inline script provided to merchants

### Q3: User Auto-Registration Strategy
**Context:** Popup mode needs to handle users without accounts.  
**Question:** How should unauthenticated popup users be handled?  
**Options:**  
(A) Auto-create guest user with random ID  
(B) Use Fynd user context from storefront SDK  
(C) Require login/registration before playing

### Q4: Coupon Application Flow
**Context:** The `Get Redeem URL` workflow applies coupon and returns cart URL.  
**Question:** Should the coupon code be visible to users or auto-applied?  
**Options:**  
(A) Show code + "Copy" + redirect to cart  
(B) Auto-apply and redirect silently  
(C) Both options (show code, button to auto-apply)

---

## 10. Next Steps

Pending your answers to Q1-Q4, I will:

1. **Implement** the `/abandoned_cart` endpoint
2. **Create** the popup script skeleton
3. **Fix** response format mismatches
4. **Add** dynamic week number calculation
5. **Generate** final unified JSON system definition
6. **Create** updated architecture diagram

---

**End of Phase 4 — Deep Coherency Analysis**

*Awaiting answers to Q1-Q4 before proceeding to implementation.*
