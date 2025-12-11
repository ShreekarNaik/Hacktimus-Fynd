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
- `mobile_number` (Text, Primary Key) - User's Mobile Number (Unique ID)
- `coins_balance` (Number/Integer) - User's coin balance
- `daily_login_streak` (Number/Integer) - Consecutive days logged in
- `last_login_date` (Text) - Last login timestamp
- `total_games_played` (Number/Integer) - Total games played
- `total_wins` (Number/Integer) - Total wins
- `wins_this_week` (Number/Integer) - Wins in current week
- `created_at` (BigInt/Number) - Account creation timestamp

#### 2. game_sessions
- `session_id` (Text, Primary Key) - Unique session identifier
- `mobile_number` (Text) - User who played
- `game_name` (Text) - Name of the game (e.g., "scratch-card", "quiz", etc.)
- `score` (Number/Integer) - Score achieved
- `coins_earned` (Number/Integer) - Coins earned from this session
- `reward_tier` (Text, Optional) - Reward tier achieved (GRAND, PREMIUM, STANDARD, BASIC)
- `completed_at` (BigInt/Number) - Session completion timestamp
- `is_cart_recovery` (Boolean) - Whether this was from cart recovery campaign
- `cart_id` (Text, Optional) - Associated cart ID if cart recovery

#### 3. leaderboard
- `id` (Text, Primary Key) - Unique leaderboard entry identifier
- `mobile_number` (Text) - User ID
- `game_name` (Text) - Game name
- `score` (Number/Integer) - High score
- `week_number` (Number/Integer) - Week number (for weekly leaderboards)
- `timestamp` (BigInt/Number) - When this score was achieved

#### 4. rewards
- `reward_id` (Text, Primary Key) - Unique reward identifier
- `mobile_number` (Text) - User who earned the reward
- `reward_type` (Text) - Type of reward (e.g., "coupon", "discount")
- `reward_tier` (Text) - Tier (GRAND, PREMIUM, STANDARD, BASIC)
- `discount_percentage` (Number/Integer) - Discount amount
- `coupon_code` (Text) - Generated coupon code
- `expiry_date` (BigInt/Number) - Expiry timestamp
- `redeemed` (Boolean) - Whether reward has been redeemed
- `distributed_at` (BigInt/Number) - When reward was distributed

#### 5. cart_abandonments
- `cart_id` (Text, Primary Key) - Unique cart identifier
- `mobile_number` (Text) - User who abandoned cart
- `items` (JSON) - Cart items array
- `cart_value` (Number/Decimal) - Total cart value
- `created_at` (BigInt/Number) - When cart was created/abandoned
- `notification_sent` (Boolean) - Whether recovery notification was sent
- `game_link` (Text, Optional) - Link to recovery game
- `converted` (Boolean) - Whether user completed purchase

#### 6. User Contact Mapping
> **Note**: This table maps user contact info to their User ID.
- `id` (Text, Primary Key) - Unique identifier
- `user_id` (Text) - The Boltic User ID
- `mobile_number` (Text) - User's mobile number
- `email` (Text, Optional) - User's email
- `application_id` (Text, Optional) - Fynd Application ID
- `company_id` (Text, Optional) - Fynd Company ID
- `created_at` (BigInt/Number) - Timestamp
- `updated_at` (BigInt/Number) - Timestamp

#### 7. brands
- `id` (Text, Primary Key) - Unique Brand ID
- `name` (Text) - Brand Name
- `created_at` (BigInt/Number) - Timestamp

#### 8. coupon_templates
- `id` (Text, Primary Key) - Unique Template ID
- `brand_id` (Text) - Reference to Brand
- `coupon_prefix` (Text) - Prefix for code generation (e.g. "DIWALI")
- `discount_percentage` (Number/Decimal) - Value of coupon (Float supported)
- `validity_days` (Number) - Days valid after distribution
- `rarity_percentage` (Number) - Rarity weight (0-100)
- `redeem_url` (Text) - URL to redeem
- `terms` (Text) - T&C Text
- `created_at` (BigInt/Number) - Timestamp

### Creating Tables Manually in Boltic Console

Since table creation requires the Boltic Console UI, follow these steps:

1. **Navigate to Tables**: https://asia-south1.console.boltic.io/
   - Click on "Tables" in the sidebar

2. **Create Tables Using AI**:
   For each table, click "Create Table", then "Start with prompts", and use these AI prompts:

   **Table 1 - users:**
   ```
   Create a table named users with columns: mobile_number (text, primary key), coins_balance (number), daily_login_streak (number), last_login_date (text), total_games_played (number), total_wins (number), wins_this_week (number), created_at (bigint).
   ```

   **Table 2 - game_sessions:**
   ```
   Create a table named game_sessions with columns: session_id (text, primary key), mobile_number (text), game_name (text), score (number), coins_earned (number), reward_tier (text, nullable), completed_at (bigint), is_cart_recovery (boolean), cart_id (text, nullable).
   ```

   **Table 3 - leaderboard:**
   ```
   Create a table named leaderboard with columns: id (text, primary key), mobile_number (text), game_name (text), score (number), week_number (number), timestamp (bigint).
   ```

   **Table 4 - rewards:**
   ```
   Create a table named rewards with columns: reward_id (text, primary key), mobile_number (text), reward_type (text), reward_tier (text), discount_percentage (number), coupon_code (text), expiry_date (bigint), redeemed (boolean), distributed_at (bigint).
   ```

   **Table 5 - cart_abandonments:**
   ```
   Create a table named cart_abandonments with columns: cart_id (text, primary key), mobile_number (text), items (json), cart_value (number), created_at (bigint), notification_sent (boolean), game_link (text, nullable), converted (boolean).
   ```

    **Table 6 - User Contact Mapping:**
    ```
    Create a table named "User Contact Mapping" with columns: id (text, primary key), user_id (text), mobile_number (text), email (text), application_id (text), company_id (text), created_at (bigint), updated_at (bigint).
    ```

    **Table 7 - brands:**
    ```
    Create a table named brands with columns: id (text, primary key), name (text), created_at (bigint).
    ```

    **Table 8 - coupon_templates:**
    ```
    Create a table named coupon_templates with columns: id (text, primary key), brand_id (text), coupon_prefix (text), discount_percentage (number), validity_days (number), rarity_percentage (number), redeem_url (text), terms (text), created_at (bigint).
    ```

3. **Important Notes**:
   - Ensure column names are in **snake_case** (e.g., `user_id`, not `userId`)
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
