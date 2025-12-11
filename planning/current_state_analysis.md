# Current-State Analysis — Hacktimus-Fynd Platform

**Generated:** 2025-12-12T02:09:42+05:30  
**Audit Version:** Phase 1 → Phase 2

---

## 1. Executive Summary

The **Hacktimus-Fynd** project is a promotional gaming platform designed to integrate with Fynd Commerce to drive customer acquisition, engagement, and cart recovery through gamified experiences. The system is built as a **hackathon MVP** with a focus on demonstrating:

1. **Exit-Intent Popup** — A game triggered when users attempt to abandon their cart
2. **Standalone Game Portal** — A React-based frontend with 4 game types
3. **Backend API** — Node.js/Express API for session management, rewards, and leaderboards
4. **Boltic Integration** — Workflows for automation and Tables for persistence
5. **Fynd Integration** — Webhooks for cart/order events and coupon generation

### Key Stakeholders (as per architecture)

| Node | Label | Role |
|------|-------|------|
| `company` | Company | The merchant/seller using Fynd Platform |
| `ecommerce` | E Commerce site | Fynd-hosted storefront (craftkart.fynd.io) |
| `popup` | Popup | Exit-intent script injected into storefront |
| `fyndgames` | FyndGames | The game frontend/backend (this repo) |
| `admin_panel` | Temporary Admin Control Panel | Manual configuration for companies |

---

## 2. Repository Structure

```
Hacktimus-Fynd/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # authController, gameController, userController, webhookController
│   │   ├── routes/          # auth, games, user, webhooks
│   │   ├── services/        # bolticService, mock/
│   │   └── models/          # types.ts (data schemas)
│   └── dev_docs.md          # Boltic setup documentation
├── frontend/                # React/TypeScript SPA
│   ├── src/
│   │   ├── api/             # client.ts, mockAdapter.ts, mockData.ts
│   │   ├── context/         # AuthContext, AdminContext
│   │   ├── components/      # GameCard, Layout, etc.
│   │   ├── games/           # SandFall, SpinWheel, ScratchCard, Quiz
│   │   ├── pages/           # Dashboard, Login, Profile, Leaderboard, Admin*
│   │   └── types/           # index.ts (frontend types)
├── boltic-workflow-exports/ # Boltic Workflow JSON definitions
│   ├── docs.md              # Workflow documentation
│   ├── Abandoned Cart Trigger.json
│   ├── Make Coupon.json
│   ├── Get Redeem URL.json
│   └── Create User in DB.json
├── popup/                   # Empty (placeholder for storefront script)
└── planning/                # Documentation and specs
    ├── spec.md              # Full system design specification
    ├── sow.md               # Statement of Work
    ├── resources.md         # External doc links
    ├── architecture_diagram.mermaid
    └── system_definition.json
```

---

## 3. Component Inventory

### 3.1 Frontend (React Application)

**Location:** `/frontend/src`  
**Framework:** React 18 + TypeScript  
**Bundler:** Vite  
**Styling:** TailwindCSS  
**State:** React Context (AuthContext, AdminContext)

#### Pages

| Page | Route | Purpose |
|------|-------|---------|
| `Login.tsx` | `/login` | Phone/OTP authentication |
| `Dashboard.tsx` | `/` | Game selection hub |
| `Leaderboard.tsx` | `/leaderboard` | Weekly rankings |
| `Profile.tsx` | `/profile` | User stats, rewards, settings |
| `AdminLogin.tsx` | `/admin/login` | Admin authentication |
| `AdminDashboard.tsx` | `/admin/dashboard` | Company/Coupon CRUD |

#### Games

| Game | Route | Type |
|------|-------|------|
| `SandFall.tsx` | `/game/sandfall` | Skill-based (Tetris-like) |
| `SpinWheel.tsx` | `/game/spin` | Luck-based |
| `ScratchCard.tsx` | `/game/scratch` | Luck-based |
| `Quiz.tsx` | `/game/quiz` | Skill-based |

#### API Client

- **`client.ts`** — Axios instance with:
  - Demo mode toggle (`VITE_USE_DEMO=true`)
  - Mock adapter injection when in demo mode
  - Auth token interceptor

- **`mockAdapter.ts`** — Full mock implementation for:
  - User auth (login, register, OTP)
  - Admin auth
  - Company CRUD
  - Coupon template CRUD
  - Game start/submit
  - Leaderboard queries
  - Reward claiming

#### Data Types (Frontend)

```typescript
interface User {
  userId: string;
  coinsBalance: number;
  dailyLoginStreak: number;
  totalWins: number;
  winsThisWeek: number;
  preferredStores?: string[];
  phoneNumber?: string;
}

interface Company {
  id: string;
  name: string;
  createdAt: string;
}

interface CouponTemplate {
  id: string;
  companyId: string;
  couponPrefix: string;
  validityDays: number;
  rarityPercentage: number; // 0-100
  discountPercentage: number;
  redeemUrl: string;
  terms: string;
  createdAt: string;
}
```

---

### 3.2 Backend (Node.js Express API)

**Location:** `/backend/src`  
**Runtime:** Node.js 20+  
**Framework:** Express.js  
**Language:** TypeScript

#### Routes

| Route | Methods | Controller |
|-------|---------|------------|
| `/api/auth` | POST | `authController` |
| `/api/user` | GET, PUT | `userController` |
| `/api/games` | POST, GET | `gameController` |
| `/api/webhooks` | POST | `webhookController` |

#### Controllers

##### `gameController.ts`
- `startGame` — Creates session, auto-registers user if needed
- `submitScore` — Calculates coins, determines rewards (30% random win rate), updates leaderboard
- `claimLeaderboardReward` — Awards #1 player with 75% discount
- `getPendingRewards` — Returns claimable rewards for user
- `getLeaderboard` — Fetches leaderboard by game name

##### `webhookController.ts`
- `handleCartWebhook` — Receives Fynd cart create/update events
- `triggerAbandonment` — Simulates abandoned cart notification trigger

##### `authController.ts` & `userController.ts`
- Basic user management (details assumed from routes)

#### Services

##### `BolticService` (`bolticService.ts`)
- **SDK:** `@boltic/sdk`
- **Methods:**
  - `insertLeaderboardEntry()`
  - `getLeaderboard(gameName, weekNumber, limit)`
  - `removeLeaderboardEntry(userId, gameName)`
  - `insertRecord<T>(tableName, record)`
  - `getUser(userId)`
  - `updateUser(userId, updates)`
  - `getUserGameSessions(userId, limit)`
  - `getUserRewards(userId, redeemedFilter?)`
  - `getCartAbandonment(cartId)`
  - `updateCartAbandonment(cartId, updates)`
  - `sendNotification(email, template, data)` — Stub

##### Mock Services (`mock/`)
- **`db.ts`** — In-memory storage for users, sessions, leaderboards, rewards, carts
- **`fynd.ts`** — Mock Fynd Platform operations:
  - `createCoupon()` — Generates `WIN{discount}_{hash}` codes
  - `getCart()` — Returns cart data
  - `applyCoupon()` — Mock coupon application

#### Data Types (Backend)

```typescript
interface User {
  userId: string;
  fyndUserId: string;
  coinsBalance: number;
  dailyLoginStreak: number;
  lastLoginDate: string;
  totalGamesPlayed: number;
  totalWins: number;
  winsThisWeek: number;
  createdAt: number;
}

interface GameSession {
  sessionId: string;
  userId: string;
  gameName: string;
  score: number;
  coinsEarned: number;
  rewardTier?: string;
  completedAt: number;
  isCartRecovery: boolean;
  cartId?: string;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  gameName: string;
  score: number;
  weekNumber: number;
  timestamp: number;
}

interface Reward {
  rewardId: string;
  userId: string;
  rewardType: string;
  rewardTier: string; // GRAND, PREMIUM, STANDARD, BASIC
  discountPercentage: number;
  couponCode: string;
  expiryDate: number;
  redeemed: boolean;
  distributedAt: number;
}

interface CartAbandonment {
  cartId: string;
  userId: string;
  items: any[];
  cartValue: number;
  createdAt: number;
  notificationSent: boolean;
  gameLink?: string;
  converted: boolean;
}
```

---

### 3.3 Boltic Integration

#### Boltic Tables (Configured in Boltic Console)

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `users` | `user_id` | User profiles |
| `game_sessions` | `session_id` | Game play records |
| `leaderboard` | `id` | Weekly rankings |
| `rewards` | `reward_id` | Distributed coupons |
| `cart_abandonments` | `cart_id` | Abandoned cart tracking |
| `User Contact Mapping` | `user_id` | User ↔ Mobile number mapping |

**Note:** Boltic Tables use **snake_case** column names (e.g., `user_id`, `game_name`).

#### Boltic Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Abandoned Cart Trigger** | Fynd Webhook (`cart.update`) | Detects cart abandonment, waits, sends SMS with game link |
| **Create User in DB** | Fynd Webhook (`user.create`) | Syncs new Fynd users to Boltic Tables |
| **Make Coupon** | HTTP POST | Creates personalized coupon via Fynd API, sends SMS |
| **Get Redeem URL** | HTTP GET | Applies coupon to cart, returns redirect URL |

##### Abandoned Cart Trigger Flow
1. Receive Fynd webhook for cart update
2. Log to email (debugging)
3. Wait 100 minutes (configurable)
4. Re-fetch cart state
5. If cart still exists and value ≥ threshold:
   - POST to backend `/abandoned_cart`
   - Generate SMS content with game link
   - Send SMS via Boltic SMS
   - Log to `cart_abandonments` table
6. Else if purchased:
   - Send thank-you SMS

##### Make Coupon Flow
1. HTTP trigger with `coupon_code`, `user_id`, `coupon_params`
2. Search user via Fynd Platform API
3. Create coupon via Fynd Application API (custom endpoint)
4. Get mobile number from Boltic Tables
5. Send personalized SMS

##### Get Redeem URL Flow
1. HTTP GET with `coupon`, `cart_id` query params
2. Apply coupon to cart via Fynd API
3. Return redirect URL to cart page

---

### 3.4 Fynd Integration

#### Referenced Fynd APIs

| API | Purpose | Documentation |
|-----|---------|---------------|
| `verifyMobileOTP` | OTP verification | [Link](https://docs.fynd.com/partners/commerce/sdk/latest/application/user#verifyMobileOTP) |
| `registerWithForm` | User registration | [Link](https://docs.fynd.com/partners/commerce/sdk/latest/application/user#registerWithForm) |
| `deleteUser` | Account deletion | [Link](https://docs.fynd.com/partners/commerce/sdk/latest/application/user#deleteUser) |
| `createCoupon` | Coupon creation | [Link](https://docs.fynd.com/partners/commerce/sdk/latest/platform/application/cart#createCoupon) |

#### Webhook Events (Subscribed)

| Event | Purpose |
|-------|---------|
| `application/cart/create/v1` | Track new cart creation |
| `application/cart/update/v1` | Track cart modifications (abandonment detection) |
| `application/user/create/v1` | Sync new users to Boltic |

#### Fynd Identifiers (Hardcoded in Workflows)

| Identifier | Value | Purpose |
|------------|-------|---------|
| `application_id` | `6936cfcb5528738f3bdab871` | CraftKart application |
| Store URL | `craftkart.fynd.io` | E-commerce storefront |

---

### 3.5 Popup/Storefront Script

**Location:** `/popup/` (Empty directory)  
**Status:** Not implemented

**Intended Behavior (from `system_definition.json`):**
- Detect mouse exit intent
- Check if user has items in cart
- Check if game hasn't been played this session
- Open iframe: `frontend_url + '?mode=popup&context=' + user_context`

---

## 4. Configuration

### 4.1 Environment Variables

#### Backend (`/backend/.env`)

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default: 3000) |
| `BOLTIC_API_KEY` | Boltic PAT token |
| `BOLTIC_REGION` | Boltic region (`asia-south1`) |

#### Frontend (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_USE_DEMO` | Enable mock mode (`true`/`false`) |

### 4.2 Game Configuration (Hardcoded)

```javascript
// gameController.ts
const WIN_LIMITS = {
  daily: 1,
  weekly: 3
};

const COIN_RATES = {
  'quiz': 0.1,     // Score / 10
  'pattern': 0.2,  // Score / 5
  'sandfall': 0.05 // Score / 20
};
```

### 4.3 Boltic Workflow Variables

| Workflow | Variable | Value |
|----------|----------|-------|
| Abandoned Cart | `BACKEND_BASE_URL` | `localhost:3000` |
| Abandoned Cart | `cart_value_threshold` | `500` |
| Make Coupon | `EXPIRY_DAYS` | `10` |
| Make Coupon | `USER_SPECIFICITY` | `true` |
| Make Coupon | `authorization_token` | `oa-...` (OAuth token) |

---

## 5. Data Flows

### 5.1 Exit Intent Flow (Intended)

```
User → [Storefront] → Exit Intent Detected
                     → [popup.js] Check Cart
                     → Open IFrame → [FyndGames Frontend]
                     → Auto-Login (Context)
                     → Play Game
                     → Submit Score
                     → [Backend] Calculate Reward
                     → Generate Coupon
                     → Return to Cart
```

### 5.2 Cart Abandonment Flow (Implemented in Boltic)

```
[Fynd Platform] → cart.update webhook → [Abandoned Cart Trigger]
                                       → Wait 100 minutes
                                       → Re-fetch cart
                                       → If not purchased:
                                         → POST /abandoned_cart
                                         → Generate game link
                                         → Send SMS
                                         → Log to Boltic Tables
```

### 5.3 Game Session Flow

```
Frontend → POST /api/games/start → Create Session
         → Play Game
         → POST /api/games/submit → Calculate Coins
                                  → Random Reward (30%)
                                  → Update Leaderboard
                                  → Return Result
```

---

## 6. Dependency Map

```
Frontend
├── axios (API client)
├── react-router-dom (routing)
├── tailwindcss (styling)
└── context/AuthContext → api/client → [Backend OR mockAdapter]

Backend
├── express (HTTP server)
├── cors (CORS middleware)
├── @boltic/sdk (Boltic integration)
├── controllers/ → services/bolticService
│                → services/mock/db
│                → services/mock/fynd
└── routes/ → controllers/

Boltic Workflows
├── Fynd Platform Webhook integration
├── Fynd Platform Application API integration
├── Boltic Tables integration
└── Boltic SMS integration
```

---

## 7. Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Games (4) | ✅ Implemented | SandFall, SpinWheel, ScratchCard, Quiz |
| Frontend Auth | ✅ Implemented | OTP flow with mock support |
| Frontend Admin Panel | ✅ Implemented | Company/Coupon CRUD (mock only) |
| Frontend Demo Mode | ✅ Implemented | Full mock adapter |
| Backend API | ✅ Implemented | Express server with routes |
| Backend Boltic Service | ⚠️ Partial | SQL execution works, some methods |
| Backend Mock Services | ✅ Implemented | In-memory DB + Fynd mock |
| Boltic Tables | ⚠️ Manual Setup | Requires console creation |
| Boltic Workflows | ⚠️ Draft Status | JSON exports, not all tested |
| Popup Script | ❌ Not Implemented | Directory empty |
| Real Fynd Integration | ⚠️ Partial | OAuth token hardcoded |

---

## 8. Identified Gaps & Observations

### 8.1 Architecture Gaps

1. **Popup Script Missing** — The `/popup/` directory is empty. No exit-intent detection implemented.

2. **Admin Panel Backend** — Admin routes (`/admin/*`) are only mocked in frontend; no backend implementation.

3. **Company Multi-Tenancy** — Hardcoded `application_id` in workflows; no dynamic company selection.

### 8.2 Integration Gaps

1. **Fynd OAuth Token** — Hardcoded in workflow (`oa-...`); no refresh mechanism.

2. **Backend ↔ Boltic Workflow Communication** — The `/abandoned_cart` endpoint expected by workflows is not implemented in backend.

3. **User Contact Mapping Table** — Referenced in workflows but not in backend schema definitions.

### 8.3 Data Schema Inconsistencies

1. **Column Naming** — Backend code uses camelCase, Boltic Tables use snake_case (handled by service but fragile).

2. **Frontend vs Backend Types** — `User` type differs (frontend has `phoneNumber`, backend has `fyndUserId`).

3. **Reward Tiers** — Backend uses `GRAND`, `PREMIUM`, `STANDARD`, `BASIC`; workflow mentions `LEGENDARY`.

### 8.4 Configuration Issues

1. **Week Number** — Hardcoded to `1` in `gameController.ts`.

2. **Backend URL** — Workflow uses `localhost:3000`; not production-ready.

3. **Win Rate** — Hardcoded 30% random win chance; not configurable.

---

## 9. Open Questions (Pending User Confirmation)

Before proceeding to Phase 4 (Deep Coherency Analysis), I need confirmation on:

1. **Scope Priority** — Should analysis focus on hackathon MVP or full spec.md vision?
2. **Popup Implementation** — Is the popup script expected to be in this repo or external?
3. **Admin Panel Backend** — Should admin CRUD be routed through backend or remain frontend-only mock?

---

## 10. Next Steps (Pending Confirmation)

After explicit user confirmation, I will proceed to:

1. **Phase 4** — Deep coherency analysis across all subsystems
2. **Phase 5** — Structured questionnaire for ambiguities
3. **Phase 6** — Final unified JSON system definition + architecture diagram

---

**End of Phase 2 — Current-State Analysis**

*Waiting for explicit user confirmation to proceed.*
