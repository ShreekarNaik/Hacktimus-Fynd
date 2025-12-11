# Backend Development Documentation

## Boltic Tables Setup

### API Configuration

**Boltic API Key (PAT Token):** `c7e49796-639c-4ed5-a191-28d738996e6a`
**Region:** `asia-south1`
**Console URL:** https://asia-south1.console.boltic.io/

### Environment Variables

Add to `.env`:
```
BOLTIC_API_KEY=c7e49796-639c-4ed5-a191-28d738996e6a
BOLTIC_REGION=asia-south1
```

### Boltic Tables Schema

#### 1. users
- `userId` (Text, Primary Key) - Unique user identifier
- `fyndUserId` (Text) - Fynd platform user ID
- `coinsBalance` (Number/Integer) - User's coin balance
- `dailyLoginStreak` (Number/Integer) - Consecutive days logged in
- `lastLoginDate` (Text) - Last login timestamp
- `totalGamesPlayed` (Number/Integer) - Total games played
- `totalWins` (Number/Integer) - Total wins
- `winsThisWeek` (Number/Integer) - Wins in current week
- `createdAt` (BigInt/Number) - Account creation timestamp

#### 2. game_sessions
- `sessionId` (Text, Primary Key) - Unique session identifier
- `userId` (Text) - User who played
- `gameName` (Text) - Name of the game (e.g., "scratch-card", "quiz", etc.)
- `score` (Number/Integer) - Score achieved
- `coinsEarned` (Number/Integer) - Coins earned from this session
- `rewardTier` (Text, Optional) - Reward tier achieved (GRAND, PREMIUM, STANDARD, BASIC)
- `completedAt` (BigInt/Number) - Session completion timestamp
- `isCartRecovery` (Boolean) - Whether this was from cart recovery campaign
- `cartId` (Text, Optional) - Associated cart ID if cart recovery

#### 3. leaderboard
- `id` (Text, Primary Key) - Unique leaderboard entry identifier
- `userId` (Text) - User ID
- `gameName` (Text) - Game name
- `score` (Number/Integer) - High score
- `weekNumber` (Number/Integer) - Week number (for weekly leaderboards)
- `timestamp` (BigInt/Number) - When this score was achieved

#### 4. rewards
- `rewardId` (Text, Primary Key) - Unique reward identifier
- `userId` (Text) - User who earned the reward
- `rewardType` (Text) - Type of reward (e.g., "coupon", "discount")
- `rewardTier` (Text) - Tier (GRAND, PREMIUM, STANDARD, BASIC)
- `discountPercentage` (Number/Integer) - Discount amount
- `couponCode` (Text) - Generated coupon code
- `expiryDate` (BigInt/Number) - Expiry timestamp
- `redeemed` (Boolean) - Whether reward has been redeemed
- `distributedAt` (BigInt/Number) - When reward was distributed

#### 5. cart_abandonments
- `cartId` (Text, Primary Key) - Unique cart identifier
- `userId` (Text) - User who abandoned cart
- `items` (JSON) - Cart items array
- `cartValue` (Number/Decimal) - Total cart value
- `createdAt` (BigInt/Number) - When cart was created/abandoned
- `notificationSent` (Boolean) - Whether recovery notification was sent
- `gameLink` (Text, Optional) - Link to recovery game
- `converted` (Boolean) - Whether user completed purchase

### Creating Tables Manually in Boltic Console

Since table creation requires the Boltic Console UI, follow these steps:

1. **Navigate to Tables**: https://asia-south1.console.boltic.io/
   - Click on "Tables" in the sidebar

2. **Create Tables Using AI**:
   For each table, click "Create Table", then "Start with prompts", and use these AI prompts:

   **Table 1 - users:**
   ```
   Create a table named users with columns: userId (text, primary key), fyndUserId (text), coinsBalance (number), dailyLoginStreak (number), lastLoginDate (text), totalGamesPlayed (number), totalWins (number), winsThisWeek (number), createdAt (bigint).
   ```

   **Table 2 - game_sessions:**
   ```
   Create a table named game_sessions with columns: sessionId (text, primary key), userId (text), gameName (text), score (number), coinsEarned (number), rewardTier (text, nullable), completedAt (bigint), isCartRecovery (boolean), cartId (text, nullable).
   ```

   **Table 3 - leaderboard:**
   ```
   Create a table named leaderboard with columns: id (text, primary key), userId (text), gameName (text), score (number), weekNumber (number), timestamp (bigint).
   ```

   **Table 4 - rewards:**
   ```
   Create a table named rewards with columns: rewardId (text, primary key), userId (text), rewardType (text), rewardTier (text), discountPercentage (number), couponCode (text), expiryDate (bigint), redeemed (boolean), distributedAt (bigint).
   ```

   **Table 5 - cart_abandonments:**
   ```
   Create a table named cart_abandonments with columns: cartId (text, primary key), userId (text), items (json), cartValue (number), createdAt (bigint), notificationSent (boolean), gameLink (text, nullable), converted (boolean).
   ```

3. **Important Notes**:
   - Ensure column names are in **camelCase** (e.g., `userId`, not `user_id`)
   - For timestamps, use **BigInt** or **Number** type
   - Mark the first column as **Primary Key** for each table
   - For optional fields, ensure they're marked as **nullable**

### Testing Boltic Connection

Run the test script to verify everything is working:

```bash
# Make sure you're in the backend directory
cd backend

# Install tsx if not already installed
pnpm add -D tsx

# Run the test
pnpm tsx src/test-boltic.ts
```

The test will:
- Verify connection to Boltic
- Test inserting a user
- Test retrieving a user
- Test inserting leaderboard entry
- Test querying leaderboard

### Current Status Notes

The Boltic SDK (@boltic/sdk v0.0.7) may not have full `tables.sql()` support yet. If that's the case:

- The service will **log SQL queries** to console
- Actual database operations will be **queued for later**
- You can still use the API - it's production-ready once SDK is updated

**Workaround during development:**
- Use the Boltic Console to manually insert test data
- Or implement direct HTTP API calls to Boltic Tables REST API

### Alternative: Direct HTTP API

If SDK doesn't support tables.sql yet, you can use direct API calls:

```typescript
// In bolticService.ts executeSql method
const response = await fetch(
  `https://asia-south1.api.boltic.io/v1/tables/query`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BOLTIC_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  }
);
const data = await response.json();
return data.results || [];
```

### Troubleshooting

**Problem:** "Module not found '@boltic/sdk'"
- **Solution:** Run `pnpm install` in the backend directory

**Problem:** "Cannot connect to Boltic"
- **Solution:** Check BOLTIC_API_KEY in `.env` is correct
- **Solution:** Verify you're using the correct region ('asia-south1')

**Problem:** "Table not found"
- **Solution:** Create tables manually in Boltic Console (see instructions above)

**Problem:** SDK doesn't have `tables.sql()` method
- **Solution:** SQL will be logged to console for now
- **Solution:** Implement direct HTTP API as workaround (see above)



Install the SDK:
```bash
pnpm add @boltic/sdk
```

Basic SDK initialization:
```typescript
import { createClient } from '@boltic/sdk';

const bolticClient = createClient(process.env.BOLTIC_API_KEY, {
  region: 'asia-south1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  debug: false
});
```

### Table Operations

**Querying Data (SELECT):**
```typescript
// Using client.tables (when SDK tables API is available)
const results = await bolticClient.tables.query({
  table: 'users',
  where: { userId: 'user123' }
});

// Or using SQL
const results = await bolticClient.tables.sql(
  `SELECT * FROM users WHERE userId = 'user123' NOLIMIT;`
);
```

**Inserting Data:**
```typescript
await bolticClient.tables.insert('users', {
  userId: 'user123',
  fyndUserId: 'fynd456',
  coinsBalance: 0,
  dailyLoginStreak: 1,
  lastLoginDate: new Date().toISOString(),
  totalGamesPlayed: 0,
  totalWins: 0,
  winsThisWeek: 0,
  createdAt: Date.now()
});
```

**Updating Data:**
```typescript
await bolticClient.tables.update('users', {
  where: { userId: 'user123' },
  data: { coinsBalance: 100 }
});
```

### Additional Notes

- For hackathon POC, focus on core functionality first
- Use simple but good programming practices
- Boltic Tables SQL editor supports DML operations: SELECT, INSERT, UPDATE, DELETE
- Query result limit is 100 by default - use NOLIMIT for full results
- Use dynamic field references in workflows: `{{step.result.field}}`
- For timestamps, use BigInt/Number type (JavaScript timestamps in milliseconds)
- JSON fields supported for complex data like cart items

### References
- Boltic Docs: https://docs.boltic.io/
- Boltic Tables: https://docs.boltic.io/integrations/Boltic%20Tables/boltic-tables
- Boltic SDK: https://docs.boltic.io/sdk/intro
