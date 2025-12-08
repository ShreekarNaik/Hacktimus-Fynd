# Plan: Fynd Promotional Games Platform for Acquisition & Conversion

A skill-based gaming platform integrated with Fynd Commerce to drive customer acquisition and conversion through transparent, fair rewards. Users earn exclusive discounts via leaderboards, cart-recovery games, and daily challenges, with clear reward rarity displays and seller-configurable limits.

## Steps

### 1. Build standalone game web app

Build standalone game web app with React + TypeScript containing Spin-the-Wheel (luck-based, limited plays), Scratch Card, and 2 LinkedIn-style skill games (Quiz + Pattern Match). Implement unified in-game coin economy with score-based earning, daily login bonuses, and configurable exchange rates for purchasing spins.

### 2. Setup Boltic Tables schemas

Setup Boltic Tables schemas for leaderboards (userId, score, gameName, timestamp, rewardStatus), user profiles (coins balance, play history, win limits), game sessions, and cart abandonment tracking. Create indexes on `(gameName, score)` for fast leaderboard queries and implement weekly reset logic excluding already-rewarded users.

### 3. Integrate Fynd Commerce APIs

Integrate Fynd Commerce APIs via Platform SDK for cart management, user authentication, and dynamic coupon generation. Create webhook listeners for `application/cart/create` and `application/cart/update` events to track cart abandonment with seller-configurable time thresholds.

### 4. Build Boltic Workflows

Build Boltic Workflows for:

- (a) scheduled cart abandonment detection (every 15 mins), generating skill-based game links with psychologically optimized messaging showing win rates
- (b) game completion handlers that validate scores, create Fynd discount coupons within seller-defined margins, and update leaderboards
- (c) weekly leaderboard finalization distributing top 10 prizes with winner photos and top 50 shopping coupons

### 5. Create iframe-embeddable widget

Create iframe-embeddable widget for Fynd storefronts with JWT-based authentication, percentile-based score-to-reward conversion, and rarity display ("1 in 1,xxxxx" odds by reward tier). Build seller admin panel for configuring game enablement, reward percentages, play limits (default: 3 wins per period), and abandonment triggers.

### 6. Deploy and integrate

Deploy and integrate frontend to Vercel, backend to Railway, and embed widget in Fynd storefront via theme bindings. Configure CORS, setup webhook URLs in Fynd Partner panel, and implement analytics tracking for seller conversion metrics.

## Further Considerations

### Embedding approach

Iframe widget recommended for fastest MVP (3-4 days implementation vs 7-10 days for full Fynd Extension). This allows independent deployment while maintaining integration via APIs. Full extension can be Phase 2 if marketplace distribution is desired.

### Timeline expectations

Realistic MVP timeline is **5-6 days** (not 2-3) to include automation workflows, proper authentication, leaderboards, and seller controls. A minimal 3-day version is possible but would lack cart abandonment automation and be manual-trigger only.

### Fynd Engage integration

Public API documentation unavailable - recommend using custom rewards via Boltic Tables + Fynd Coupon APIs for MVP. Contact Fynd support for Engage API access if unified loyalty platform integration is required later.

## Technical Architecture

### Recommended Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Boltic Tables
- **Automation**: Boltic Workflows
- **Hosting**: Vercel (frontend) + Railway (backend)
- **CDN**: Pixelbin (Fynd's image service)

### Architecture Overview

```
┌─────────────────────────────────────────┐
│   Fynd Storefront (Theme + Binding)    │
│   ┌─────────────────────────────────┐   │
│   │  Iframe: Game Widget            │   │
│   │  (https://yourgame.com)         │   │
│   └─────────────────────────────────┘   │
│                ↕                         │
│     Fynd Application SDK                │
│     (Cart, User, Coupon APIs)           │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│   Game Backend (Your Server)            │
│   - Node.js + Express                   │
│   - Game logic & scoring                │
│   - Fynd API integration                │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│   Boltic Platform                       │
│   ┌──────────────┐  ┌────────────────┐ │
│   │ Tables       │  │ Workflows      │ │
│   │ (Leaderboard)│  │ (Automation)   │ │
│   └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────┘
```

## Key Features for MVP

### Core Game Types

1. **Spin-the-Wheel**: Luck-based, limited daily plays, can purchase additional spins with coins
2. **Scratch Card**: Instant reveal rewards with transparent odds display
3. **Quiz Game**: LinkedIn-style IQ questions, skill-based scoring
4. **Pattern Match**: Memory/pattern recognition game, unlimited plays

### Reward System

- **Leaderboard-based**: Weekly top 10 get premium prizes, next 50 get shopping coupons
- **Cart Abandonment**: Skill-based games trigger after seller-configured duration, instant discount on completion
- **Rarity Display**: Show "1 in X" odds for each reward tier to build trust
- **Win Limits**: Configurable per-user limit (default: 3 wins per period) with cross-game eligibility

### In-Game Coin Economy

- **Earning**: Game scores, daily login, achievements
- **Spending**: Purchase limited-play spins (high risk/reward)
- **Configurable**: Exchange rates and earning rules adjustable for experimentation

### Seller Controls

- Enable/disable specific games
- Set reward percentages and margins
- Configure cart abandonment thresholds
- Customize notification templates
- View analytics and conversion metrics
- Set win limit policies

## Data Schemas

### Leaderboard Table

```javascript
{
  id: "auto-generated",
  userId: "string",
  userName: "string",
  score: "number",
  gameName: "string",
  timestamp: "number",
  rewardStatus: "pending | claimed | ineligible",
  weekNumber: "number"
}
```

### User Profile Table

```javascript
{
  userId: "string",
  coinsBalance: "number",
  totalWins: "number",
  winsThisPeriod: "number",
  lastPlayDate: "timestamp",
  dailyLoginStreak: "number",
  achievements: ["array"]
}
```

### Cart Abandonment Table

```javascript
{
  cartId: "string",
  userId: "string",
  createdAt: "timestamp",
  lastUpdated: "timestamp",
  items: ["array"],
  cartValue: "number",
  notificationSent: "boolean",
  gameTriggered: "boolean",
  converted: "boolean"
}
```

### Game Session Table

```javascript
{
  sessionId: "string",
  userId: "string",
  gameName: "string",
  score: "number",
  coinsEarned: "number",
  rewardGenerated: "object | null",
  completedAt: "timestamp"
}
```

## Implementation Phases

### Phase 1: Core Games (Days 1-2)

- Setup project structure with TypeScript
- Build 4 game types with responsive UI
- Implement coin economy logic
- Local state management and scoring

### Phase 2: Backend Integration (Days 3-4)

- Setup Express server with TypeScript
- Integrate Fynd Platform SDK
- Setup Boltic Tables and SDK
- Implement webhook listeners
- JWT authentication flow
- Coupon generation logic

### Phase 3: Automation & Leaderboards (Day 5)

- Create Boltic Workflows for cart abandonment
- Implement leaderboard calculations
- Weekly reset logic with eligibility checks
- Notification system integration
- Winner photo gallery feature

### Phase 4: Deployment & Testing (Day 6)

- Deploy to Vercel and Railway
- Create iframe widget wrapper
- Test embedding in Fynd storefront
- Configure CORS and webhooks
- Seller admin panel
- End-to-end testing

## Critical Implementation Notes

### Authentication Flow

1. User visits Fynd storefront (logged in)
2. Theme passes user token to game iframe via secure query params
3. Game backend validates token with Fynd Platform API
4. Session established with validated user context

### Cart Abandonment Detection

1. Fynd webhook fires on `application/cart/create`
2. Store cart data in Boltic Tables with timestamp
3. Boltic Workflow runs every 15 minutes
4. Check for carts older than threshold (seller-configured)
5. Generate unique game link with user context
6. Send notification with psychological messaging (e.g., "78% of players won a discount!")

### Leaderboard Reset Logic

1. Weekly cron job checks all game scores
2. Calculate top 60 players per game
3. Filter out users who hit win limit this period
4. Award top 10 premium prizes, next 50 coupons
5. Create winner gallery with photos (opt-in)
6. Reset all scores but maintain eligibility tracking

### Coupon Generation with Margins

1. Game completion sends score to backend
2. Calculate percentile-based reward tier
3. Check seller-defined margin limits for product/cart
4. Generate Fynd coupon via Platform API
5. Set expiry (24-72 hours for urgency)
6. Return coupon code to user immediately

### Rarity Display Calculation

```javascript
// Example: Reward tiers with transparent odds
const rewardTiers = [
  { name: "Grand Prize", value: "50% off", odds: "1 in 10,000" },
  { name: "Premium", value: "30% off", odds: "1 in 1,000" },
  { name: "Standard", value: "15% off", odds: "1 in 100" },
  { name: "Basic", value: "5% off", odds: "1 in 10" },
];
```

## APIs and Webhooks

### Fynd Platform APIs Used

- `platformClient.cart.getCart()` - Fetch cart details
- `platformClient.order.getOrders()` - Order history
- `platformClient.rewards.createCoupon()` - Generate discount codes
- `platformClient.application()` - Application context

### Fynd Webhooks Subscribed

- `application/cart/create/v1` - New cart created
- `application/cart/update/v1` - Cart modified
- `application/order/create/v1` - Order placed (conversion tracking)

### Boltic Workflows

- **Cart Abandonment Checker** (Schedule: _/15 _ \* \* \*)
- **Game Completion Handler** (HTTP Trigger)
- **Weekly Leaderboard Finalizer** (Schedule: 0 0 \* \* 0)
- **Daily Coin Reset** (Schedule: 0 0 \* \* \*)

## Testing Strategy

### Unit Tests

- Game logic and scoring algorithms
- Coin economy calculations
- Reward tier determination
- Leaderboard ranking logic

### Integration Tests

- Fynd API interactions
- Boltic Tables CRUD operations
- Workflow triggers and execution
- Webhook payload handling

### E2E Tests

- Complete game flow from start to reward
- Cart abandonment trigger to game notification
- Leaderboard updates and weekly resets
- Seller configuration changes

### Manual Testing Checklist

- [ ] All 4 games playable and scoring correctly
- [ ] Coins earned and spent properly
- [ ] Leaderboards update in real-time
- [ ] Cart abandonment detection works
- [ ] Coupons generated with correct discounts
- [ ] Iframe embeds in Fynd storefront
- [ ] Mobile responsive UI
- [ ] Seller admin panel functional
- [ ] Win limits enforced correctly
- [ ] Weekly resets preserve eligibility

## Success Metrics

### Acquisition Metrics

- New user registrations via game invites
- Abandoned cart recovery rate
- First-time purchase conversions

### Engagement Metrics

- Daily active users (DAU)
- Average games played per user
- Daily login streak retention
- Coin economy velocity

### Conversion Metrics

- Coupon redemption rate
- Average order value with game discount
- Repeat purchase rate of game users
- Seller ROI (discount cost vs increased sales)

### Fairness Metrics

- Win distribution across user segments
- Leaderboard diversity (prevent monopolization)
- Reward claim rate by tier
- User trust scores (survey-based)

## Risk Mitigation

### Technical Risks

- **Rate limiting**: Implement exponential backoff and caching
- **Real-time performance**: Use Redis for leaderboard caching
- **Webhook reliability**: Implement retry logic and idempotency
- **Database scalability**: Monitor Boltic Tables limits, plan migration if needed

### Business Risks

- **Discount abuse**: Enforce win limits and device fingerprinting
- **Margin protection**: Validate all discounts against seller rules
- **User fatigue**: A/B test game difficulty and reward frequency
- **Trust issues**: Transparent odds display and public winner verification

### Security Risks

- **Token validation**: Always verify Fynd JWT signatures
- **CORS protection**: Whitelist only authorized domains
- **SQL injection**: Use parameterized queries in Boltic
- **Rate limiting**: Prevent bot abuse with CAPTCHA if needed

## Future Enhancements (Post-MVP)

### Phase 2 Features

- [ ] More game types (Slots, Trivia tournaments, Time trials)
- [ ] Social features (Challenge friends, Share scores)
- [ ] Fynd Engage API integration (if docs become available)
- [ ] Mobile native app version
- [ ] Advanced analytics dashboard with ML insights

### Phase 3 Features

- [ ] Tournament mode with bracket competitions
- [ ] Team-based challenges for B2B sellers
- [ ] Seasonal events and special game modes
- [ ] Influencer partnership program
- [ ] Blockchain-based reward verification (optional)

### Optimization Opportunities

- [ ] Machine learning for personalized game difficulty
- [ ] Dynamic reward tier adjustment based on inventory
- [ ] Predictive cart abandonment detection
- [ ] A/B testing framework for game mechanics
- [ ] Real-time WebSocket updates for leaderboards
