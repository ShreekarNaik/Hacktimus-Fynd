#!/bin/bash

# Database Schema Update Script
# This script provides the SQL commands to add new columns to the rewards table
# Run these commands in the Boltic Console SQL interface

echo "=================================================="
echo "REWARDS TABLE SCHEMA UPDATE"
echo "=================================================="
echo ""
echo "Please run the following SQL commands in Boltic Console:"
echo ""
echo "1. Add redeem_url column:"
echo "   ALTER TABLE rewards ADD COLUMN redeem_url TEXT;"
echo ""
echo "2. Add terms column:"
echo "   ALTER TABLE rewards ADD COLUMN terms TEXT;"
echo ""
echo "3. Add company column:"
echo "   ALTER TABLE rewards ADD COLUMN company TEXT;"
echo ""
echo "=================================================="
echo ""
echo "After running these commands:"
echo "1. Restart the backend server: pnpm run dev"
echo "2. Test by playing a game and winning a reward"
echo "3. Check Profile page for rewards display"
echo ""
echo "For detailed instructions, see:"
echo "  - backend/REWARD_SCHEMA_UPDATE.md"
echo "  - backend/COUPON_FIX_SUMMARY.md"
echo "=================================================="
