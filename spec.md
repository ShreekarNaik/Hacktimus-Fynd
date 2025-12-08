# Fynd Promotional Games Platform - System Design Specification

## 1. Executive Overview

### 1.1 Vision

A standalone promotional gaming platform that integrates with Fynd Commerce to drive customer acquisition and conversion through skill-based, transparent reward mechanics. The platform gamifies the shopping experience by offering exclusive discounts earned through fair gameplay, leaderboard competitions, and cart recovery interventions.

### 1.2 Core Objectives

- **Customer Acquisition**: Attract new users through engaging game mechanics and promotional campaigns
- **Conversion Optimization**: Recover abandoned carts via targeted game-based discount incentives
- **Engagement**: Build habit loops through daily challenges, streaks, and competitive leaderboards
- **Trust & Transparency**: Display clear reward probabilities and maintain fairness in reward distribution

### 1.3 Key Differentiators

- **Skill-based over luck-based**: Minimize randomness to prevent "rigged" perception
- **Transparent rarity system**: Show "1 in X" odds for each reward tier
- **Seller-controlled margins**: All discounts respect merchant-defined profit boundaries
- **Cross-game eligibility**: Users hitting win limits in one game can participate in others
- **Exclusive discounts**: Clear communication that rewards are genuine, not price manipulation

---

## 2. System Architecture Overview

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    STANDALONE WEB PLATFORM                   │
│                  (games.yourplatform.com)                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Game Hub   │  │  Leaderboard │  │ User Profile │      │
│  │   Portal     │  │    System    │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │          Game Engines (4 types)                  │       │
│  │  Spin Wheel | Scratch Card | Quiz | Pattern     │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↕ API Integration
┌─────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Fynd Commerce│  │    Boltic    │  │   Backend    │      │
│  │   Platform   │  │   Platform   │  │    Server    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Frontend Platform** (Standalone Web Application)

- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS for responsive design
- **State Management**: React Context + Zustand for complex state
- **Routing**: React Router v6
- **Game Rendering**: HTML5 Canvas + React Spring for animations
- **Hosting**: Vercel (edge network deployment)

**Backend Services**

- **Runtime**: Node.js 20+ with Express.js
- **Language**: TypeScript (strict mode)
- **Authentication**: JWT tokens + Fynd OAuth integration
- **API Layer**: RESTful APIs with rate limiting
- **Hosting (preferred)**: **Boltic Workflows / HTTP Functions / Gateway** for serverless API endpoints;

**Data & Automation**

- **Database**: Boltic Tables (NoSQL, managed)
- **Workflows**: Boltic Workflows (serverless automation)
- **Caching**: Redis (for leaderboards and session data)
- **File Storage**: Boltic Storage (game assets, user avatars)

**External Integrations**

- **Fynd Commerce**: Platform SDK for cart, orders, coupons
- **Boltic SDK**: `@boltic/sdk` for Tables, Workflows, Storage
- **Notifications**: Email/SMS via Boltic integrations

---

## 3. Core System Components

### 3.1 User Journey & Flow

#### 3.1.1 New User Flow

```
1. User lands on games.platform.com
2. Registration/Login via Fynd OAuth
3. Tutorial modal explains game types and reward system
4. Welcome bonus: 100 coins + 3 free spins
5. Dashboard shows available games and current leaderboard
```

#### 3.1.2 Regular User Flow

```
1. User logs in → Dashboard
2. Daily login bonus (coins + streak tracker)
3. Choose game type:
   a. Skill-based games (unlimited plays)
   b. Spin-the-wheel (limited daily, or spend coins)
4. Play game → Earn score → Convert to coins
5. Check leaderboard ranking
6. Claim rewards if eligible
```

#### 3.1.3 Cart Abandonment Flow

```
1. User abandons cart on Fynd store (tracked via webhook)
2. After X minutes (seller-configured), trigger detected
3. Email/SMS sent: "Play a game to unlock discount!"
4. User clicks link → Redirected to game platform
5. Plays skill-based game (difficulty: moderate)
6. Score-based discount generated (max capped by seller)
7. Coupon code delivered instantly
8. Redirected back to cart with coupon applied
```

### 3.2 Game Types & Mechanics

#### 3.2.1 Spin-the-Wheel (Luck-Based)

**Mechanism**: Traditional probability wheel with visible segments

- **Play Limits**: 3 free spins per day
- **Coin Purchase**: 50 coins = 1 additional spin
- **Reward Distribution**:
  - 60% → Small rewards (5-10% discount)
  - 30% → Medium rewards (15-20% discount)
  - 9% → Large rewards (25-35% discount)
  - 1% → Grand prize (40-50% discount)
- **Transparency**: Odds displayed before spin
- **UI**: Animated wheel with haptic feedback

**Reference**: Standard wheel-of-fortune mechanic with server-side validation

#### 3.2.2 Scratch Card (Instant Reveal)

**Mechanism**: Digital scratch-off card revealing hidden rewards

- **Play Limits**: 5 free cards per day
- **Coin Purchase**: 30 coins = 1 card
- **Reward Types**:
  - Discount codes
  - Bonus coins
  - Extra spins
  - "Try again" (50% of cards)
- **Transparency**: Total probability shown (e.g., "1 in 20 cards wins 20%+")
- **UI**: Canvas-based scratch effect with progressive reveal

**Reference**: Mobile game scratch card mechanics with anti-cheat validation

#### 3.2.3 Quiz Game (Skill-Based)

**Mechanism**: LinkedIn-style IQ/trivia questions with time limits

- **Play Limits**: Unlimited (score-based coin rewards)
- **Format**:
  - 10 questions per round
  - 15 seconds per question
  - Multiple difficulty levels
- **Scoring**:
  - Correct answer: +10 points
  - Time bonus: +5 points (if answered <7 seconds)
  - Streak bonus: +20 points (5 consecutive correct)
- **Leaderboard**: Daily/Weekly based on highest score
- **Categories**: General knowledge, Math, Logic, Trivia
- **UI**: Clean, minimal design with progress bar

**Coin Conversion**: Score ÷ 10 = Coins earned (capped at 100 coins/round)

**Reference**: Modeled after LinkedIn Games, Kahoot, Quizlet mechanics

#### 3.2.4 Pattern Match (Memory Game)

**Mechanism**: Card matching / sequence memorization

- **Play Limits**: Unlimited (score-based rewards)
- **Difficulty Levels**:
  - Easy: 4x4 grid, 3 lives
  - Medium: 5x5 grid, 2 lives
  - Hard: 6x6 grid, 1 life
- **Scoring**:
  - Match found: +15 points
  - Speed bonus: +5 points (match <3 seconds)
  - Perfect round: +50 bonus
- **Leaderboard**: Weekly highest score per difficulty
- **UI**: Card flip animations, visual feedback

**Coin Conversion**: (Score × Difficulty Multiplier) ÷ 5 = Coins

**Reference**: Classic memory card game with progressive difficulty

### 3.3 Reward System Architecture

#### 3.3.1 Reward Tier Structure

```javascript
// Reward tiers with transparent probability
const REWARD_TIERS = {
  GRAND: {
    name: "Grand Prize",
    discountRange: "40-50%",
    probability: 0.0001, // 1 in 10,000
    displayOdds: "1 in 10,000",
    color: "#FFD700", // Gold
  },
  PREMIUM: {
    name: "Premium Reward",
    discountRange: "25-35%",
    probability: 0.001, // 1 in 1,000
    displayOdds: "1 in 1,000",
    color: "#C0C0C0", // Silver
  },
  STANDARD: {
    name: "Standard Reward",
    discountRange: "15-20%",
    probability: 0.01, // 1 in 100
    displayOdds: "1 in 100",
    color: "#CD7F32", // Bronze
  },
  BASIC: {
    name: "Basic Reward",
    discountRange: "5-10%",
    probability: 0.1, // 1 in 10
    displayOdds: "1 in 10",
    color: "#4CAF50", // Green
  },
};
```

#### 3.3.2 Leaderboard Reward Distribution

**Weekly Leaderboard Structure** (Per Game Type)

```
Rank 1:    50% discount coupon + 500 bonus coins + Winner badge
Rank 2:    40% discount coupon + 400 bonus coins
Rank 3:    35% discount coupon + 300 bonus coins
Rank 4-10: 25% discount coupon + 200 bonus coins
Rank 11-60: 15% discount coupon + 100 bonus coins
```

**Winner Features**:

- Profile photo displayed in "Hall of Fame"
- Previous week's winners showcased on homepage
- Social share functionality (optional)
- Winner history tracking

**Reset Mechanism**:

- Every Sunday 11:59 PM (configurable timezone)
- All scores reset to 0
- Win limits reset per user
- Previous rankings archived
- Rewards distributed before reset

#### 3.3.3 Win Limit System

**Purpose**: Prevent reward abuse and ensure distribution fairness

**Configuration** (Seller-defined, defaults):

```javascript
const WIN_LIMITS = {
  dailyWinLimit: 1, // Max 1 reward per day
  weeklyWinLimit: 3, // Max 3 rewards per week
  monthlyWinLimit: 10, // Max 10 rewards per month
  leaderboardEligibility: {
    cooldownPeriod: 2, // 2 weeks before re-eligible
  },
};
```

**Cross-Game Tracking**:

- Limits apply across ALL game types
- Winning in Quiz counts toward same limit as Spin-the-Wheel
- Exception: Leaderboard rewards (tracked separately)

**Eligibility Logic**:

```
User can play: Always (engagement encouraged)
User can earn coins: Always
User can win discount rewards: Only if within limits
User appears on leaderboard: Always
User can claim leaderboard prize: Only if not won in cooldown period
```

### 3.4 Coin Economy Design

#### 3.4.1 Earning Mechanisms

```javascript
const COIN_EARNING = {
  dailyLogin: 20, // Login streak bonus
  gameScore: {
    quiz: "score ÷ 10", // 100 score = 10 coins
    patternMatch: "(score × difficulty) ÷ 5",
    spinWheel: "0", // No coins from luck games
    scratchCard: "0 or 50", // Bonus reward only
  },
  achievements: {
    firstWin: 100,
    streak5Days: 150,
    playAllGames: 200,
    leaderboardTop10: 500,
  },
  referral: 50, // Per successful referral
};
```

#### 3.4.2 Spending Mechanisms

```javascript
const COIN_SPENDING = {
  spinWheel: 50, // Buy additional spin
  scratchCard: 30, // Buy additional card
  powerUps: {
    extraLife: 25, // For pattern match
    timeFreeze: 40, // For quiz (5 sec extra)
    hint: 15, // Reveal one answer
  },
};
```

#### 3.4.3 Balance & Anti-Inflation

- **Maximum Balance**: 5,000 coins (encourages spending)
- **Coin Expiry**: None (user retention)
- **Exchange Rate**: Non-transferable, non-cashable
- **Earning Cap**: 200 coins per day from gameplay

---

## 4. Integration Layer Design

### 4.1 Fynd Commerce Integration

**Reference Documentation**: https://docs.fynd.com/

#### 4.1.1 Platform SDK Usage

**Installation**:

```bash
npm install @gofynd/fdk-client-javascript
```

**Authentication Flow**:

```javascript
// Initialize Platform Client with API credentials
const { PlatformClient } = require("@gofynd/fdk-client-javascript");

const client = new PlatformClient({
  companyId: process.env.FYND_COMPANY_ID,
  apiKey: process.env.FYND_API_KEY,
  apiSecret: process.env.FYND_API_SECRET,
});
```

**Key APIs Used**:

1. **Cart Management** (`platformClient.cart`)

   - `getCart({ uid })`: Fetch user cart details
   - Used for: Cart abandonment tracking
   - Webhook: `application/cart/create/v1`, `application/cart/update/v1`

2. **Coupon Generation** (`platformClient.rewards`)

   - `createCoupon({ code, discount, validity })`: Create discount codes
   - Used for: Reward redemption
   - Validation: Server-side before distribution

3. **User Data** (`platformClient.user`)

   - `getUserById({ id })`: Fetch user profile
   - Used for: Authentication, personalization

4. **Order Tracking** (`platformClient.order`)
   - `getOrders({ userId })`: Fetch purchase history
   - Used for: Conversion attribution, analytics

#### 4.1.2 Webhook Configuration

**Setup Location**: Fynd Partner Panel → Developer Console → Webhooks

**Subscribed Events**:

```javascript
{
  "application/cart/create/v1": {
    handler: "handleCartCreation",
    purpose: "Track new cart for abandonment"
  },
  "application/cart/update/v1": {
    handler: "handleCartUpdate",
    purpose: "Update cart modification timestamp"
  },
  "application/order/create/v1": {
    handler: "handleOrderConversion",
    purpose: "Mark cart as converted, track attribution"
  }
}
```

**Webhook Payload Example** (Cart Creation):

```json
{
  "event": "application/cart/create/v1",
  "payload": {
    "cartId": "cart_abc123",
    "userId": "user_xyz789",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 2,
        "price": 1999
      }
    ],
    "cartValue": 3998,
    "createdAt": "2025-12-06T10:30:00Z"
  }
}
```

**Webhook Handler Design**:

- Idempotency: Track processed webhook IDs to prevent duplicates
- Retry Logic: Exponential backoff for failed processing
- Security: Validate webhook signature using Fynd secret

#### 4.1.3 Discount Application Flow

```
1. User wins game → Score validated server-side
2. Calculate discount % based on score percentile
3. Check seller margin constraints for cart items
4. Generate unique coupon code via Fynd API
5. Set coupon constraints:
   - minCartValue: Based on seller config
   - maxDiscount: Capped by margin
   - validity: 48 hours (urgency factor)
   - usageLimit: 1 (single-use)
6. Store coupon in database (audit trail)
7. Return coupon to user via API response
8. User applies coupon on Fynd storefront
9. Track redemption via order webhook
```

### 4.2 Boltic Platform Integration

**Reference Documentation**: https://docs.boltic.io/

#### 4.2.1 Boltic Tables (Database)

**Installation**:

```bash
npm install @boltic/sdk
```

**Initialization**:

```javascript
import { createClient } from "@boltic/sdk";

const boltic = createClient({
  apiKey: process.env.BOLTIC_API_KEY,
  region: "us-east-1", // or appropriate region
});
```

**Schema Design**:

**Table 1: `leaderboards`**

```javascript
{
  tableName: "leaderboards",
  database: "games_platform",
  indexes: [
    { fields: ["gameName", "score"], order: "desc" },
    { fields: ["weekNumber", "gameName"] }
  ],
  schema: {
    id: "string (auto)",
    userId: "string (indexed)",
    userName: "string",
    userAvatar: "string (url)",
    score: "number",
    gameName: "string (enum: quiz, pattern, spin, scratch)",
    timestamp: "number (unix)",
    weekNumber: "number (calculated)",
    rewardStatus: "string (enum: pending, claimed, ineligible)",
    rewardTier: "string (nullable)"
  }
}
```

**Table 2: `user_profiles`**

```javascript
{
  tableName: "user_profiles",
  database: "games_platform",
  indexes: [
    { fields: ["userId"], unique: true }
  ],
  schema: {
    userId: "string (primary)",
    fyndUserId: "string",
    coinsBalance: "number (default: 100)",
    dailyLoginStreak: "number (default: 0)",
    lastLoginDate: "string (ISO date)",
    totalGamesPlayed: "number",
    totalWins: "number",
    winsThisWeek: "number",
    winsThisMonth: "number",
    achievements: "array<string>",
    createdAt: "timestamp",
    lastPlayedAt: "timestamp"
  }
}
```

**Table 3: `cart_abandonment`**

```javascript
{
  tableName: "cart_abandonment",
  database: "games_platform",
  indexes: [
    { fields: ["userId", "createdAt"] },
    { fields: ["notificationSent", "converted"] }
  ],
  schema: {
    cartId: "string (primary)",
    userId: "string",
    fyndCartId: "string",
    items: "array<object>",
    cartValue: "number",
    createdAt: "timestamp",
    lastUpdated: "timestamp",
    abandonmentThreshold: "number (minutes)",
    notificationSent: "boolean (default: false)",
    notificationSentAt: "timestamp (nullable)",
    gameTriggered: "boolean (default: false)",
    gameLink: "string (nullable)",
    converted: "boolean (default: false)",
    convertedAt: "timestamp (nullable)",
    couponGenerated: "string (nullable)"
  }
}
```

**Table 4: `game_sessions`**

```javascript
{
  tableName: "game_sessions",
  database: "games_platform",
  indexes: [
    { fields: ["userId", "completedAt"] },
    { fields: ["gameName", "score"] }
  ],
  schema: {
    sessionId: "string (uuid)",
    userId: "string",
    gameName: "string",
    difficulty: "string (nullable)",
    score: "number",
    coinsEarned: "number",
    rewardGenerated: "object (nullable)",
    isCartRecovery: "boolean",
    cartId: "string (nullable)",
    completedAt: "timestamp",
    duration: "number (seconds)"
  }
}
```

**Table 5: `rewards_distributed`**

```javascript
{
  tableName: "rewards_distributed",
  database: "games_platform",
  indexes: [
    { fields: ["userId", "distributedAt"] },
    { fields: ["couponCode"], unique: true }
  ],
  schema: {
    rewardId: "string (uuid)",
    userId: "string",
    rewardType: "string (enum: game, leaderboard, cart_recovery)",
    rewardTier: "string",
    discountPercentage: "number",
    couponCode: "string",
    fyndCouponId: "string",
    expiryDate: "timestamp",
    redeemed: "boolean (default: false)",
    redeemedAt: "timestamp (nullable)",
    distributedAt: "timestamp",
    gameSessionId: "string (nullable)"
  }
}
```

**CRUD Operations**:

```javascript
// Insert leaderboard entry
await boltic.tables.insert({
  database: "games_platform",
  table: "leaderboards",
  data: {
    userId: "user_123",
    score: 850,
    gameName: "quiz",
    timestamp: Date.now(),
    weekNumber: getCurrentWeekNumber(),
  },
});

// Query top 10 leaderboard
const topPlayers = await boltic.tables.list({
  database: "games_platform",
  table: "leaderboards",
  filters: {
    gameName: { $eq: "quiz" },
    weekNumber: { $eq: getCurrentWeekNumber() },
  },
  sort: [{ field: "score", order: "desc" }],
  limit: 10,
});

// Update user coins
await boltic.tables.update({
  database: "games_platform",
  table: "user_profiles",
  filters: { userId: { $eq: "user_123" } },
  data: { coinsBalance: { $increment: 50 } },
});
```

#### 4.2.2 Boltic Workflows (Automation)

**Workflow 1: Cart Abandonment Detector**

```yaml
name: cart_abandonment_detector
trigger:
  type: schedule
  cron: "*/15 * * * *" # Every 15 minutes

actions:
  - name: query_abandoned_carts
    type: boltic.tables.list
    params:
      database: games_platform
      table: cart_abandonment
      filters:
        notificationSent: false
        converted: false

  - name: filter_eligible_carts
    type: javascript
    code: |
      const now = Date.now();
      return items.filter(cart => {
        const elapsed = (now - cart.createdAt) / 60000; // minutes
        return elapsed >= cart.abandonmentThreshold;
      });

  - name: generate_game_links
    type: foreach
    items: "{{ filtered_carts }}"
    actions:
      - name: create_game_link
        type: http.post
        url: "{{ process.env.BACKEND_URL }}/api/generate-cart-recovery-link"
        body:
          userId: "{{ item.userId }}"
          cartId: "{{ item.cartId }}"
          cartValue: "{{ item.cartValue }}"

      - name: send_notification
        type: boltic.notification.send
        params:
          type: email
          to: "{{ item.userEmail }}"
          template: cart_recovery_game
          data:
            gameLink: "{{ game_link }}"
            winRate: "78%" # Psychological trigger

      - name: update_cart_status
        type: boltic.tables.update
        params:
          database: games_platform
          table: cart_abandonment
          filters: { cartId: "{{ item.cartId }}" }
          data:
            notificationSent: true
            notificationSentAt: "{{ now }}"
            gameLink: "{{ game_link }}"
```

**Workflow 2: Game Completion Handler**

```yaml
name: game_completion_handler
trigger:
  type: http
  endpoint: /webhooks/game-completed
  method: POST

actions:
  - name: validate_game_result
    type: javascript
    code: |
      // Anti-cheat validation
      const { userId, gameName, score, sessionId } = request.body;
      const maxPossibleScore = getMaxScore(gameName);
      if (score > maxPossibleScore) {
        throw new Error("Invalid score detected");
      }
      return { validated: true, ...request.body };

  - name: check_win_limits
    type: boltic.tables.get
    params:
      database: games_platform
      table: user_profiles
      filters: { userId: "{{ validated.userId }}" }

  - name: calculate_reward
    type: javascript
    code: |
      const { score, winsThisWeek, gameName } = context;
      if (winsThisWeek >= WIN_LIMITS.weeklyWinLimit) {
        return { eligible: false, reason: "Weekly limit reached" };
      }

      const percentile = calculatePercentile(score, gameName);
      const rewardTier = getRewardTier(percentile);
      return { eligible: true, rewardTier, discountPercentage: rewardTier.discount };

  - name: generate_coupon
    type: http.post
    condition: "{{ reward.eligible }}"
    url: "{{ process.env.BACKEND_URL }}/api/fynd/create-coupon"
    body:
      userId: "{{ validated.userId }}"
      discountPercentage: "{{ reward.discountPercentage }}"
      cartId: "{{ validated.cartId }}"

  - name: update_leaderboard
    type: boltic.tables.insert
    params:
      database: games_platform
      table: leaderboards
      data:
        userId: "{{ validated.userId }}"
        score: "{{ validated.score }}"
        gameName: "{{ validated.gameName }}"
        timestamp: "{{ now }}"

  - name: award_coins
    type: boltic.tables.update
    params:
      database: games_platform
      table: user_profiles
      filters: { userId: "{{ validated.userId }}" }
      data:
        coinsBalance: { $increment: "{{ calculated_coins }}" }
        totalGamesPlayed: { $increment: 1 }
```

**Workflow 3: Weekly Leaderboard Finalizer**

```yaml
name: weekly_leaderboard_finalizer
trigger:
  type: schedule
  cron: "0 0 * * 0" # Every Sunday midnight

actions:
  - name: get_all_game_types
    type: javascript
    code: return ["quiz", "pattern_match", "spin_wheel", "scratch_card"];

  - name: process_each_game
    type: foreach
    items: "{{ game_types }}"
    actions:
      - name: fetch_top_60
        type: boltic.tables.list
        params:
          database: games_platform
          table: leaderboards
          filters:
            gameName: "{{ item }}"
            weekNumber: "{{ current_week }}"
          sort: [{ field: "score", order: "desc" }]
          limit: 60

      - name: filter_eligible_winners
        type: javascript
        code: |
          // Remove users who won in last 2 weeks
          const eligible = [];
          for (const player of top_60) {
            const recentWins = await checkRecentWins(player.userId, 2);
            if (!recentWins) eligible.push(player);
          }
          return eligible.slice(0, 60); // Re-slice after filtering

      - name: distribute_rewards
        type: foreach
        items: "{{ eligible_winners }}"
        actions:
          - name: assign_reward_tier
            type: javascript
            code: |
              const rank = index + 1;
              if (rank === 1) return { tier: "grand", discount: 50 };
              if (rank === 2) return { tier: "second", discount: 40 };
              if (rank === 3) return { tier: "third", discount: 35 };
              if (rank <= 10) return { tier: "top10", discount: 25 };
              if (rank <= 60) return { tier: "top60", discount: 15 };

          - name: create_leaderboard_coupon
            type: http.post
            url: "{{ backend_url }}/api/fynd/create-coupon"
            body:
              userId: "{{ item.userId }}"
              discountPercentage: "{{ reward.discount }}"
              type: "leaderboard"
              validity: 7 # days

          - name: send_winner_notification
            type: boltic.notification.send
            params:
              type: email
              to: "{{ item.userEmail }}"
              template: leaderboard_winner
              data:
                rank: "{{ rank }}"
                gameName: "{{ gameName }}"
                couponCode: "{{ coupon.code }}"

          - name: update_reward_status
            type: boltic.tables.update
            params:
              database: games_platform
              table: leaderboards
              filters: { id: "{{ item.id }}" }
              data:
                rewardStatus: "claimed"
                rewardTier: "{{ reward.tier }}"

  - name: archive_old_leaderboard
    type: boltic.tables.update
    params:
      database: games_platform
      table: leaderboards
      filters: { weekNumber: "{{ current_week }}" }
      data: { archived: true }

  - name: reset_weekly_counters
    type: boltic.tables.updateMany
    params:
      database: games_platform
      table: user_profiles
      data: { winsThisWeek: 0 }
```

**Workflow 4: Daily Maintenance**

```yaml
name: daily_maintenance
trigger:
  type: schedule
  cron: "0 0 * * *" # Every day at midnight

actions:
  - name: update_login_streaks
    type: javascript
    code: |
      // Reset streaks for users who didn't login yesterday
      const yesterday = getYesterdayDate();
      await boltic.tables.updateMany({
        database: "games_platform",
        table: "user_profiles",
        filters: { lastLoginDate: { $ne: yesterday } },
        data: { dailyLoginStreak: 0 }
      });

  - name: expire_old_coupons
    type: boltic.tables.list
    params:
      database: games_platform
      table: rewards_distributed
      filters:
        redeemed: false
        expiryDate: { $lt: "{{ now }}" }

  - name: mark_expired
    type: boltic.tables.updateMany
    params:
      database: games_platform
      table: rewards_distributed
      filters:
        { rewardId: { $in: "{{ expired_rewards.map(r => r.rewardId) }}" } }
      data: { status: "expired" }
```

#### 4.2.3 Boltic Storage (Assets)

**Use Cases**:

- User avatar uploads
- Game asset CDN (card images, wheel graphics)
- Winner photo gallery
- Achievement badges

**SDK Usage**:

```javascript
// Upload user avatar
const uploadResult = await boltic.storage.upload({
  bucket: "user-avatars",
  file: avatarFile,
  path: `users/${userId}/avatar.jpg`,
  metadata: {
    userId: userId,
    uploadedAt: Date.now(),
  },
});

// Get public URL
const avatarUrl = await boltic.storage.getPublicUrl({
  bucket: "user-avatars",
  path: `users/${userId}/avatar.jpg`,
});
```

---

## 5. User Experience Design

### 5.1 Dashboard Layout

**Components**:

1. **Top Navigation Bar**

   - Logo + Platform name
   - User profile dropdown (avatar, coins balance, logout)
   - Notification bell (game invites, rewards)

2. **Hero Section**

   - Welcome message: "Welcome back, {Name}!"
   - Daily login streak indicator
   - Coin balance prominently displayed
   - CTA: "Claim Daily Bonus"

3. **Game Grid** (4 cards in 2x2 responsive layout)

   - Each card shows:
     - Game icon/thumbnail
     - Game name
     - "Play Now" button
     - Play limits indicator (e.g., "2/3 spins left")
     - Last played timestamp

4. **Leaderboard Widget** (Right sidebar)

   - Current week rankings
   - User's current position highlighted
   - "View Full Leaderboard" link

5. **Recent Activity Feed** (Bottom section)
   - Recent wins across platform
   - "User X won 25% discount 5 mins ago"
   - Builds social proof and FOMO

### 5.2 Game UI Principles

**Design Standards**:

- **Loading States**: Skeleton screens, no blank flashes
- **Animations**: Smooth 60fps, spring physics for natural feel
- **Feedback**: Haptic feedback on mobile, sound effects (toggleable)
- **Accessibility**: WCAG AA compliant, keyboard navigation
- **Responsive**: Mobile-first design, touch-optimized controls

**Game Screen Structure**:

```
┌─────────────────────────────────────┐
│  [Back Button]    GAME NAME   [?]   │ ← Header
├─────────────────────────────────────┤
│                                     │
│          GAME CANVAS AREA           │ ← Interactive area
│       (Full-screen on mobile)       │
│                                     │
├─────────────────────────────────────┤
│  Score: 245   Lives: ❤️❤️   Time: 45s │ ← Stats bar
├─────────────────────────────────────┤
│  [Pause]  [Hints: 2]  [Coins: 350] │ ← Actions
└─────────────────────────────────────┘
```

### 5.3 Reward Claim Flow

**Post-Game Screen**:

```
┌─────────────────────────────────────┐
│           🎉 CONGRATULATIONS!       │
│                                     │
│         You scored: 850             │
│         Coins earned: +85           │
│                                     │
│    ┌─────────────────────────┐     │
│    │   YOUR REWARD UNLOCKED   │     │
│    │                          │     │
│    │   25% DISCOUNT COUPON    │     │
│    │   Code: GAME25OFF        │     │
│    │   Valid until: Dec 8     │     │
│    │                          │     │
│    │   [Copy Code]            │     │
│    │   [Shop Now]             │     │
│    └─────────────────────────────┘  │
│                                     │
│  Rarity: 1 in 100 players win this! │
│                                     │
│  [Share Score]  [Play Again]        │
└─────────────────────────────────────┘
```

### 5.4 Cart Recovery User Flow

**Email/SMS Template**:

```
Subject: 🎮 Play a game, save more on your cart!

Hi {Name},

We noticed you left some items in your cart. How about a fun challenge?

Play our Pattern Match game and unlock up to 35% off your order!

🎯 78% of players win at least 15% discount
⏰ Your cart is waiting (expires in 24 hours)

[PLAY NOW AND SAVE] ← CTA Button

---
Game Platform powered by Fynd Commerce
```

**Landing Experience**:

1. User clicks CTA → Redirected to `games.platform.com/cart-recovery?token={jwt}`
2. Auto-login via token validation
3. Modal explains: "Complete the game to unlock your discount!"
4. Game pre-selected (skill-based, moderate difficulty)
5. Cart items preview shown on sidebar
6. Post-game: Coupon auto-applied, redirect to checkout

### 5.5 Transparency & Trust Elements

**Odds Display** (Before playing luck-based games):

```
┌─────────────────────────────────────┐
│         SPIN THE WHEEL               │
│                                      │
│  Your chances to win:                │
│  • 5-10% discount:   60%   (3 in 5) │
│  • 15-20% discount:  30%   (1 in 3) │
│  • 25-35% discount:  9%    (1 in 11)│
│  • 40-50% discount:  1%    (1 in 100)│
│                                      │
│  [ ✓ I understand ]  [Play Now]     │
└─────────────────────────────────────┘
```

**Winner Verification**:

- Hall of Fame with real user photos (opt-in)
- Timestamp of win
- Truncated user IDs (privacy)
- "Verified Win" badge

---

## 6. Security & Anti-Cheat Mechanisms

### 6.1 Score Validation

**Client-Side Prevention**:

- Obfuscated game logic
- Time-based checks (impossible to score too fast)
- Client-side checksum validation

**Server-Side Validation**:

```javascript
function validateGameScore(gameData) {
  const { gameName, score, duration, timestamp } = gameData;

  // Rule 1: Max theoretical score
  const maxScore = getMaxPossibleScore(gameName, duration);
  if (score > maxScore) return { valid: false, reason: "Impossible score" };

  // Rule 2: Minimum time required
  const minDuration = getMinimumDuration(gameName, score);
  if (duration < minDuration) return { valid: false, reason: "Too fast" };

  // Rule 3: Session token validation
  const session = getSession(gameData.sessionToken);
  if (!session || session.expired)
    return { valid: false, reason: "Invalid session" };

  // Rule 4: Device fingerprinting
  const deviceId = getDeviceFingerprint(request);
  if (isBlacklisted(deviceId))
    return { valid: false, reason: "Suspicious device" };

  return { valid: true };
}
```

**Behavioral Analysis**:

- Track win rate per user (flag if > 90%)
- Monitor score distribution (flag outliers)
- Device fingerprinting (prevent multi-accounting)

### 6.2 Coupon Security

**Unique Code Generation**:

```javascript
function generateCouponCode(userId, rewardTier) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  const prefix = rewardTier.substring(0, 4).toUpperCase();

  return `${prefix}${timestamp}${random}`.toUpperCase();
  // Example: GRAN1k2m8a7f
}
```

**Constraints**:

- Single-use only
- User-specific (tied to Fynd user ID)
- Time-limited expiry
- Minimum cart value requirement
- Non-transferable

### 6.3 Rate Limiting

**API Endpoints**:

```javascript
const RATE_LIMITS = {
  "/api/game/start": "10 per minute per user",
  "/api/game/complete": "5 per minute per user",
  "/api/leaderboard/view": "30 per minute per user",
  "/api/rewards/claim": "2 per hour per user",
};
```

**Implementation**: Express middleware with Redis-based counters

### 6.4 Privacy & Data Protection

**User Data Handling**:

- GDPR/CCPA compliant data collection
- Minimal data storage (email, user ID, scores)
- User consent for photo display
- Right to deletion (cascade delete from all tables)
- Encrypted storage for sensitive data

**Cookie Policy**:

- Session cookies (authentication)
- Analytics cookies (optional, user consent)
- No third-party tracking

---

## 7. Analytics & Monitoring

### 7.1 Key Performance Indicators (KPIs)

**Acquisition Metrics**:

- New user registrations per day
- Cart abandonment recovery rate
- Conversion rate (game player → purchaser)
- Attribution: Sales generated via game coupons

**Engagement Metrics**:

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (stickiness)
- Average sessions per user
- Session duration
- Retention rate (D1, D7, D30)

**Game Performance**:

- Play rate per game type
- Completion rate (started vs finished)
- Average score per game
- Coin economy velocity (earned vs spent)

**Revenue Impact**:

- Total discount value distributed
- Revenue attributed to game coupons
- ROI = (Revenue from game users - Discount cost) / Platform cost
- Average order value (game users vs non-game users)

### 7.2 Monitoring Dashboard

**Real-Time Metrics** (For Platform Operators):

```
┌─────────────────────────────────────────────────────┐
│  Live Activity Monitor                              │
├─────────────────────────────────────────────────────┤
│  • Active players now: 347                          │
│  • Games in progress: 89                            │
│  • Coupons distributed today: 156                   │
│  • Total discount value: $12,450                    │
│  • Revenue attributed: $45,200 (3.62x ROI)          │
├─────────────────────────────────────────────────────┤
│  Top Games (Today)                                  │
│  1. Quiz Game         - 542 plays                   │
│  2. Pattern Match     - 421 plays                   │
│  3. Spin Wheel        - 298 plays                   │
│  4. Scratch Card      - 187 plays                   │
└─────────────────────────────────────────────────────┘
```

**Seller Dashboard**:

- Sales impact from game platform
- Discount budget utilization
- Top converting games for their products
- Customer acquisition cost via games

### 7.3 A/B Testing Framework

**Testable Parameters**:

- Game difficulty levels
- Reward distribution percentages
- UI/UX variations
- Notification messaging
- Coupon expiry durations

**Implementation**: Feature flags + segment-based routing

---

## 8. Deployment Architecture

### 8.1 Standalone Web Platform

**Domain Structure**:

- Primary: `games.yourplatform.com`
- API: `api.games.yourplatform.com`
- Assets CDN: `cdn.games.yourplatform.com`

**Hosting Strategy**:

- **Frontend**: Vercel (edge network, auto-scaling)
- **Backend (preferred)**: Boltic Workflows / HTTP Functions exposed via Boltic Gateway for serverless APIs; supports deploying code bundles (zip/GitHub) similar to Railway/Functions models.
- **Database**: Boltic Tables (managed service)
- **Cache**: Redis Cloud (managed) or Boltic Tables + in-memory cache where latency allows
- **CDN**: Cloudflare (in front of Vercel)

### 8.2 CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
name: Deploy Platform

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build backend
        run: npm run build
      - name: Package functions for Boltic (zip bundle)
        run: zip -r backend-bundle.zip dist package.json package-lock.json
      - name: Deploy to Boltic Workflows/Gateway
        run: |
          boltic deploy functions backend-bundle.zip \
            --workspace=${{ secrets.BOLTIC_WORKSPACE }} \
            --token=${{ secrets.BOLTIC_TOKEN }} \
            --gateway-route=/api \
            --format=http
      - name: (Optional fallback) Deploy to Railway
        if: failure() # Use Railway only if Boltic deploy fails or feature gaps are detected
        run: railway up --service backend
```

### 8.3 Environment Configuration

**Development**:

- Local development server
- Fynd sandbox environment
- Boltic development workspace
- Mock payment gateways

**Staging**:

- Pre-production testing
- Real Fynd integration (test company)
- Load testing environment

**Production**:

- Multi-region deployment
- Auto-scaling enabled
- 99.9% uptime SLA
- Monitoring alerts

---

## 9. Seller Onboarding & Configuration

### 9.1 Admin Panel Design

**Seller Access**: `games.platform.com/admin`

**Configuration Sections**:

**1. Game Settings**

```
┌─────────────────────────────────────┐
│  Game Type        Status   Config   │
├─────────────────────────────────────┤
│  Spin Wheel       [ON]    [Edit]    │
│  Scratch Card     [ON]    [Edit]    │
│  Quiz Game        [ON]    [Edit]    │
│  Pattern Match    [OFF]   [Edit]    │
└─────────────────────────────────────┘

Per-game config modal:
- Enable/Disable toggle
- Difficulty level (Easy, Medium, Hard)
- Reward range (min/max discount %)
- Play frequency limits
```

**2. Reward Configuration**

```
┌─────────────────────────────────────┐
│  Discount Policy                     │
├─────────────────────────────────────┤
│  Maximum discount %:  [ 35 ]         │
│  Minimum cart value:  [ ₹500 ]       │
│  Coupon validity:     [ 48 ] hours   │
│  Daily budget:        [ ₹10,000 ]    │
│                                      │
│  Win Limits:                         │
│  • Per day:           [ 1 ]          │
│  • Per week:          [ 3 ]          │
│  • Per month:         [ 10 ]         │
└─────────────────────────────────────┘
```

**3. Cart Abandonment Settings**

```
┌─────────────────────────────────────┐
│  Abandonment Trigger                 │
├─────────────────────────────────────┤
│  Time threshold:   [ 30 ] minutes    │
│  Minimum cart:     [ ₹1000 ]         │
│  Max discount:     [ 25 ]%           │
│                                      │
│  Notification Template:              │
│  [Edit Email Template]               │
│  [Edit SMS Template]                 │
│                                      │
│  Psychology messaging:               │
│  ☑ Show win rate statistics          │
│  ☑ Display urgency ("cart expires")  │
│  ☐ Include customer testimonials     │
└─────────────────────────────────────┘
```

**4. Analytics Dashboard**

```
┌─────────────────────────────────────┐
│  Performance Overview (Last 30 days) │
├─────────────────────────────────────┤
│  Total games played:      12,450     │
│  Coupons distributed:     3,120      │
│  Redemption rate:         68%        │
│  Revenue generated:       ₹8,45,000  │
│  Total discount cost:     ₹1,24,000  │
│  ROI:                     6.8x       │
│                                      │
│  [Download Full Report]              │
└─────────────────────────────────────┘
```

### 9.2 Integration Workflow

**Step 1: Seller Registration**

1. Seller signs up on platform
2. Connects Fynd Commerce store (OAuth flow)
3. Grants API permissions (cart, orders, coupons)

**Step 2: Configuration**

1. Completes onboarding wizard
2. Sets reward policies and margins
3. Configures notification preferences
4. Reviews and approves terms

**Step 3: Testing Phase**

1. Platform generates test game links
2. Seller tests end-to-end flow
3. Validates coupon generation and application
4. Confirms cart abandonment triggers

**Step 4: Go Live**

1. Seller activates platform for customers
2. Monitoring begins
3. Weekly performance reports sent
4. Ongoing optimization recommendations

---

## 10. Future Enhancements (Post-MVP)

### 10.1 Iframe Widget Integration (Phase 2)

**Purpose**: Embed games directly in Fynd storefronts

**Implementation**:

```html
<!-- Seller adds this snippet to theme -->
<div id="game-widget-container"></div>
<script src="https://cdn.games.platform.com/widget.js"></script>
<script>
  GameWidget.init({
    containerId: "game-widget-container",
    sellerId: "seller_123",
    position: "sidebar", // or 'modal', 'bottom-bar'
    games: ["spin", "scratch"], // Which games to show
    triggerMode: "cart", // Show when cart has items
  });
</script>
```

**Features**:

- Popup modal on button click
- Sidebar persistent widget
- Cart page integration
- Post-checkout celebration game

**Technical Considerations**:

- Cross-origin authentication (postMessage API)
- Responsive iframe sizing
- Performance optimization (lazy loading)
- Security (CSP headers, sandboxing)

### 10.2 Social Features

**Functionality**:

- Challenge friends to beat your score
- Share wins on social media
- Team-based competitions
- Referral program with bonus coins

**Data Requirements**:

- Friend relationships (graph structure)
- Social share templates
- Challenge tracking table

### 10.3 Advanced Analytics

**Machine Learning Integration**:

- Predict cart abandonment likelihood
- Personalized game difficulty
- Dynamic reward optimization
- Churn prediction and prevention

**Tools**: Python backend with scikit-learn, integrated via Boltic Workflows

### 10.4 Mobile Native App

**Rationale**: Better performance, push notifications, offline play

**Stack**: React Native (code reuse from web)

**Features**:

- Native game rendering (higher FPS)
- Push notifications for game invites
- Biometric authentication
- Apple/Google Wallet integration for coupons

### 10.5 Blockchain-Based Rewards (Optional)

**Concept**: NFT-based achievement badges, verifiable on-chain

**Benefits**:

- Immutable win history
- Tradeable rewards (if regulatory compliant)
- Cross-platform portability

**Caution**: Regulatory complexity, requires legal review

---

## 11. Success Criteria & Validation

### 11.1 MVP Success Metrics (3-Month Horizon)

**Acquisition**:

- ✅ 1,000+ registered users
- ✅ 20% conversion rate (game player → buyer)
- ✅ 15% cart abandonment recovery rate

**Engagement**:

- ✅ 40% DAU/MAU ratio
- ✅ 3+ games played per active user per week
- ✅ 60% D7 retention

**Business**:

- ✅ 5x ROI for sellers (revenue vs discount cost)
- ✅ 10+ sellers actively using platform
- ✅ $50,000+ attributed revenue

**Quality**:

- ✅ <1% reported issues (bugs, fairness complaints)
- ✅ 4.5+ star user rating
- ✅ 99.5% uptime

### 11.2 Validation Methodology

**Phase 1: Alpha Testing (Week 1-2)**

- Internal team testing
- 10 beta users (friends/family)
- Focus: Bug identification, UX feedback

**Phase 2: Beta Launch (Week 3-6)**

- 100 early adopters
- 2-3 seller partners
- Focus: Scalability, seller onboarding, analytics validation

**Phase 3: Public Launch (Week 7+)**

- Open to all Fynd Commerce sellers
- Marketing push (content, ads, partnerships)
- Focus: Growth, retention, revenue

### 11.3 Risk Assessment

**High Risks**:

1. **Low user engagement**: Mitigation: A/B test game mechanics, add social features
2. **Reward abuse**: Mitigation: Strict validation, device fingerprinting, win limits
3. **Seller margin erosion**: Mitigation: Hard caps, dynamic pricing recommendations

**Medium Risks**:

1. **Technical scalability**: Mitigation: Load testing, auto-scaling infrastructure
2. **Integration complexity**: Mitigation: Comprehensive documentation, support team

**Low Risks**:

1. **User privacy concerns**: Mitigation: Clear privacy policy, minimal data collection
2. **Payment fraud**: Mitigation: Fynd handles payments, coupons are validated server-side

---

## 12. Documentation & References

### 12.1 External Resources

**Fynd Platform**:

- Documentation: https://docs.fynd.com/
- Partner Portal: https://partners.fynd.com/
- Platform SDK: https://github.com/gofynd/fdk-client-javascript
- Community Forum: https://community.fynd.com/

**Boltic Platform**:

- Documentation: https://docs.boltic.io/
- SDK: https://github.com/boltic-io/boltic-sdk
- Workflow Examples: https://docs.boltic.io/workflows/examples
- API Reference: https://docs.boltic.io/api

**Technical Standards**:

- JWT Authentication: https://jwt.io/
- REST API Design: https://restfulapi.net/
- TypeScript: https://www.typescriptlang.org/docs/
- React Best Practices: https://react.dev/learn

### 12.2 Internal Documentation (To Be Created)

1. **API Documentation** (Swagger/OpenAPI)

   - All backend endpoints
   - Request/response schemas
   - Authentication flows
   - Error codes

2. **Game Development Guide**

   - Adding new game types
   - Scoring algorithms
   - UI component library
   - Testing procedures

3. **Seller Onboarding Manual**

   - Step-by-step setup
   - Configuration best practices
   - Troubleshooting guide
   - FAQ

4. **Operations Runbook**
   - Deployment procedures
   - Monitoring dashboards
   - Incident response
   - Backup/recovery

---

## 13. Conclusion

This specification defines a comprehensive, standalone promotional gaming platform that integrates seamlessly with Fynd Commerce to drive measurable business outcomes. The design prioritizes:

✅ **User Trust**: Transparent odds, skill-based mechanics, verifiable wins  
✅ **Seller Control**: Configurable margins, budgets, and policies  
✅ **Technical Scalability**: Serverless architecture, managed services  
✅ **Business Impact**: Clear ROI tracking, attribution, analytics

The MVP focuses on core functionality (4 game types, leaderboards, cart recovery) as a standalone platform, with iframe embedding deferred to Phase 2 to reduce initial complexity.

**Next Steps**:

1. Finalize technical stack and tooling choices
2. Setup development environment and CI/CD
3. Begin Phase 1 implementation (game engines)
4. Parallel track: Fynd + Boltic integration setup
5. Iterative testing and refinement

**Estimated Timeline**: 5-6 weeks from kickoff to public MVP launch.
