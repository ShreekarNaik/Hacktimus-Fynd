/**
 * Test script for coupon creation via Boltic workflow
 *
 * Usage: tsx src/scripts/test-coupon-creation.ts
 */

import { config } from "dotenv";
import axios from "axios";

config();

// Sample coupon payload - EXACT copy from Body_Format_for_Coupon_creation.json
// Only changing: code (dynamic timestamp)
const couponCode = "TEST_" + Date.now().toString().slice(-6);
const sampleCouponPayload = {
  rule_definition: {
    scope: ["brand_id"],
    calculate_on: "esp",
    is_exact: false,
    currency_code: "INR",
    type: "bundle",
    applicable_on: "quantity",
    auto_apply: false,
    value_type: "absolute",
  },
  display_meta: {
    description: "",
    remove: {
      subtitle: "",
      title: "",
    },
    apply: {
      subtitle: "You saved 1000 bucks",
      title: "Wow! You just got an awesome deal",
    },
    subtitle: "test subtitle",
    auto: {
      subtitle: "",
      title: "",
    },
    title: "1000 Off on first 2 items",
  },
  rule: [
    {
      max: 0,
      min: 3000,
      value: 1001,
      key: 2,
    },
  ],
  state: {
    is_display: true,
    is_archived: false,
    is_public: true,
  },
  identifiers: {
    user_id: [],
    brand_id: [9],
  },
  ownership: {
    payable_category: "seller",
    payable_by: "",
  },
  _schedule: {
    duration: null,
    end: "2026-10-19T08:47:39.025Z",
    next_schedule: [
      {
        start: "2019-10-18T08:35:39.000Z",
        end: "2026-10-19T08:47:39.025Z",
      },
    ],
    status: "approved",
    start: "2019-10-18T08:35:39.000Z",
    cron: null,
  },
  validation: {
    user_registered_after: null,
    app_id: ["5e1d9bec6d6b7e000146c840"],
    anonymous: true,
  },
  validity: {
    priority: 0,
  },
  action: {
    action_date: null,
    txn_mode: "coupon",
  },
  type_slug: "bundle_quantity_absolute",
  coupon_counts: 1,
  coupon_type: "single",
  coupon_prefix: "TEST_",
  restrictions: {
    uses: {
      remaining: {
        app: -1,
        total: -1,
        user: -1,
      },
      maximum: {
        app: -1,
        total: -1,
        user: -1,
      },
    },
    post_order: {
      return_allowed: true,
      cancellation_allowed: true,
    },
    platforms: ["web", "android", "ios"],
  },
  code: couponCode,
};

async function testCouponCreation() {
  console.log("🧪 Testing Coupon Creation via Boltic Workflow\n");

  // Check environment variable
  const workflowUrl = process.env.BOLTIC_MAKE_COUPON_WORKFLOW_URL;

  if (!workflowUrl) {
    console.error("❌ BOLTIC_MAKE_COUPON_WORKFLOW_URL is not set in .env file");
    console.log("\nPlease add the following to your .env file:");
    console.log(
      "BOLTIC_MAKE_COUPON_WORKFLOW_URL=https://asia-south1.workflow.boltic.app/add6173e-c0f3-44ab-a115-9b3a88f3fe1f/makecoupon"
    );
    process.exit(1);
  }

  console.log("✅ Workflow URL configured:", workflowUrl);

  // Test parameters
  const testCouponCode = couponCode;
  const testMobileNumber = "9876543210";

  console.log("\n📋 Test Parameters:");
  console.log("  Coupon Code:", testCouponCode);
  console.log("  Mobile Number:", testMobileNumber);

  // Construct URL with query parameters
  const url = new URL(workflowUrl);
  url.searchParams.set("coupon_code", testCouponCode);
  url.searchParams.set("mobile_number", testMobileNumber);

  console.log("\n🔗 Request URL:", url.toString());
  console.log("\n📦 Payload Structure:");
  console.log(
    JSON.stringify(sampleCouponPayload, null, 2).slice(0, 500) + "...\n"
  );

  try {
    console.log("📤 Sending request to Boltic workflow...\n");

    const response = await axios.post(url.toString(), sampleCouponPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("✅ SUCCESS! Coupon creation workflow triggered");
    console.log("\n📥 Response:");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("\n✨ Test completed successfully!");
  } catch (error: any) {
    console.error("❌ ERROR: Failed to create coupon via Boltic workflow");

    if (error.response) {
      console.error("\n📥 Response Error:");
      console.error("  Status:", error.response.status);
      console.error("  Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("\n📡 Request Error: No response received");
      console.error("  Message:", error.message);
    } else {
      console.error("\n⚠️  Error:", error.message);
    }

    process.exit(1);
  }
}

// Run test
testCouponCreation().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
