# Coupon Creation Quick Reference

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Add to .env
BOLTIC_MAKE_COUPON_WORKFLOW_URL=https://asia-south1.workflow.boltic.app/{workflow-id}/makecoupon
```

### 2. Test Connection

```bash
pnpm run test:coupon
```

### 3. Use the API

```bash
curl -X POST http://localhost:3000/api/admin/coupons \
  -H "Content-Type: application/json" \
  -d '{"brandId": "9", "couponPrefix": "TEST", "mobileNumber": "9876543210"}'
```

## 📋 Common Use Cases

### Use Case 1: Simple Coupon (Template Only)

**No Boltic workflow, just store template**

```json
POST /api/admin/coupons
{
  "brandId": "9",
  "couponPrefix": "SAVE"
}
```

### Use Case 2: User-Specific Coupon

**Triggers Boltic workflow + SMS**

```json
{
  "brandId": "9",
  "couponPrefix": "WELCOME",
  "mobileNumber": "9876543210"
}
```

### Use Case 3: Custom Discount

**Full customization**

```json
{
  "brandId": "9",
  "couponPrefix": "SAVE",
  "mobileNumber": "9876543210",
  "discountValue": 500,
  "minValue": 2000,
  "validityDays": 15,
  "title": "₹500 Off on orders above ₹2000",
  "applySubtitle": "You saved ₹500!"
}
```

### Use Case 4: Premium Coupon

**High value, restricted**

```json
{
  "brandId": "9",
  "couponPrefix": "PREMIUM",
  "mobileNumber": "9876543210",
  "discountValue": 2000,
  "minValue": 10000,
  "validityDays": 7,
  "maximumUser": 1,
  "isPublic": false,
  "title": "₹2000 Off - Exclusive",
  "platforms": ["web", "ios"]
}
```

### Use Case 5: Cart Recovery Coupon

**For abandoned cart users**

```json
{
  "brandId": "9",
  "couponPrefix": "COMEBACK",
  "mobileNumber": "9876543210",
  "discountValue": 300,
  "minValue": 1500,
  "validityDays": 3,
  "title": "Come Back! ₹300 Off",
  "applyTitle": "Welcome back!",
  "applySubtitle": "Complete your purchase now"
}
```

## 🎯 Key Fields Reference

### Required

- `brandId` - Brand identifier (e.g., "9")
- `couponPrefix` - Prefix for coupon code (e.g., "SAVE")

### Optional - Common

- `mobileNumber` - User's phone (triggers workflow)
- `discountValue` - Discount amount (default: 1001)
- `minValue` - Minimum cart value (default: 3000)
- `validityDays` - Days valid (default: 30)
- `title` - Display title
- `subtitle` - Display subtitle

### Optional - Advanced

- `maxValue` - Maximum cart value (0 = unlimited)
- `calculateOn` - "esp" | "mrp" (default: "esp")
- `valueType` - "absolute" | "percentage" (default: "absolute")
- `platforms` - ["web", "android", "ios"]
- `maximumUser` - Uses per user (-1 = unlimited)
- `isPublic` - Public visibility (default: true)
- `anonymous` - Allow anonymous users (default: true)

## 🔍 Response Structure

```json
{
  "success": true,
  "coupon": {
    "id": "uuid",
    "brandId": "9",
    "couponPrefix": "SAVE",
    "discountPercentage": 20,
    "validityDays": 30,
    "createdAt": 1702345678901
  },
  "couponCode": "SAVE123456",
  "workflowResponse": {
    "message": "Success"
  }
}
```

## ⚡ Pro Tips

1. **Auto-generation**: Coupon code is auto-generated as `{prefix}{6-digit-timestamp}`
2. **Dates**: Start/end dates calculated automatically from `validityDays`
3. **Defaults**: All optional fields have sensible defaults
4. **Workflow**: Only triggered when `mobileNumber` is provided
5. **Storage**: Template always stored in database

## 🧪 Testing Workflow

```bash
# 1. Check environment
echo $BOLTIC_MAKE_COUPON_WORKFLOW_URL

# 2. Run test script
pnpm run test:coupon

# 3. Test API endpoint
curl -X POST http://localhost:3000/api/admin/coupons \
  -H "Content-Type: application/json" \
  -d @test-coupon.json
```

## 🐛 Quick Troubleshooting

| Error                                     | Solution                   |
| ----------------------------------------- | -------------------------- |
| "BOLTIC_MAKE_COUPON_WORKFLOW_URL not set" | Add to .env file           |
| "Brand and Prefix required"               | Include in request body    |
| "timeout of 30000ms exceeded"             | Check workflow is active   |
| "Failed to insert coupon"                 | Verify Boltic Tables setup |

## 📚 More Info

- Complete Guide: `COUPON_INTEGRATION_GUIDE.md`
- API Docs: `dev_docs.md`
- Body Format: `Body_Format_for_Coupon_creation.json`

---

**Quick Test Command:**

```bash
curl -X POST http://localhost:3000/api/admin/coupons \
  -H "Content-Type: application/json" \
  -d '{"brandId":"9","couponPrefix":"TEST","mobileNumber":"9876543210","discountValue":500,"minValue":2000}'
```
