# Rewards Table Schema Update

## Overview

The rewards table has been updated to include additional fields for better user experience when displaying coupons.

## New Columns Required

Add the following columns to the `rewards` table in Boltic Console:

- **Type:** Text
- **Description:** Terms and conditions for the coupon
- **Default:** NULL (optional field)
- **Example:** `Valid for 7 days from date of issue. 10% discount on minimum purchase of ₹100. Cannot be combined with other offers. Single use only.`

### 2. company

- **Type:** Text
- **Description:** Company/brand name offering the coupon
- **Default:** NULL (optional field)
- **Example:** `Fynd Games`, `Nike`, `Starbucks`

## SQL Commands for Boltic Tables

Execute these commands in the Boltic Console SQL interface:

```sql
-- Add terms column
ALTER TABLE rewards ADD COLUMN terms TEXT;

-- Add company column
ALTER TABLE rewards ADD COLUMN company TEXT;
```

**Note:** `redeem_url` is NOT stored in the database as it's the same for all rewards (`https://www.fynd.com`). The frontend uses a constant value.

## Updated Schema

After the migration, the complete `rewards` table schema will be:

- `reward_id` (Text, Primary Key) - Unique reward identifier
- `mobile_number` (Text) - User who earned the reward
- `reward_type` (Text) - Type of reward (e.g., "coupon", "discount")
- `reward_tier` (Text) - Tier (GRAND, PREMIUM, STANDARD, BASIC, LEGENDARY)
- `discount_percentage` (Number/Integer) - Discount amount
- `coupon_code` (Text) - Generated coupon code
- `expiry_date` (BigInt/Number) - Expiry timestamp
- `redeemed` (Boolean) - Whether reward has been redeemed
- `distributed_at` (BigInt/Number) - When reward was distributed
- **`terms` (Text, Optional) - Terms and conditions**
- **`company` (Text, Optional) - Company/brand name**

## Impact

These fields are optional and backwards compatible. Existing rewards without these fields will still work, but new rewards will include this information for better UX.

## Testing

After applying the schema changes:

1. Play a game and win a reward
2. Check the Profile page - rewards should display with company name
3. Click on a reward to view details - should show terms and redeem button
4. The Boltic workflow should successfully create coupons in Fynd

## Notes

- The backend code has been updated to populate these fields automatically
- Frontend displays these fields when available
- If fields are missing, fallback values are used (e.g., "Fynd Games" for company)
