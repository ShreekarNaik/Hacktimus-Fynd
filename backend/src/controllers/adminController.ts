import { Request, Response } from "express";
import { boltic } from "../services/bolticService";
import { Brand, CouponTemplate } from "../models/types";
// Mock Admin Credentials
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin",
};

const generateId = () => require("crypto").randomUUID();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    res.json({
      token: `admin-jwt-${generateId()}`,
      admin: { username },
    });
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
};

// ===== BRANDS =====

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await boltic.getBrands();
    res.json(brands);
  } catch (err) {
    console.error("Get Brands Error:", err);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const brand: Brand = {
      id: generateId(),
      name,
      createdAt: Date.now(),
    };

    await boltic.insertBrand(brand);
    res.json(brand);
  } catch (err) {
    console.error("Create Brand Error:", err);
    res.status(500).json({ error: "Failed to create brand" });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const success = await boltic.updateBrand(id, name);
    if (!success) {
      res.status(404).json({ error: "Brand not found or failed to update" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update Brand Error:", err);
    res.status(500).json({ error: "Failed to update brand" });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await boltic.deleteBrand(id);
    if (!success) {
      res.status(404).json({ error: "Brand not found or failed to delete" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Brand Error:", err);
    res.status(500).json({ error: "Failed to delete brand" });
  }
};

// ===== COUPONS =====

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await boltic.getCoupons();
    res.json(coupons);
  } catch (err) {
    console.error("Get Coupons Error:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { brandId, couponPrefix, mobileNumber } = req.body;
    if (!brandId || !couponPrefix) {
      res
        .status(400)
        .json({ error: "Brand ID and Coupon Prefix are required" });
      return;
    }

    // Generate unique coupon code (alphanumeric with underscores only)
    const couponCode = `${couponPrefix}${Date.now().toString().slice(-6)}`;

    // Calculate end date
    const validityDays = req.body.validityDays || 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + validityDays);

    // EXACT structure from Body_Format_for_Coupon_creation.json
    // Only replacing: identifiers.user_id, identifiers.brand_id, _schedule.end/next_schedule.end, code
    const couponPayload = {
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
          title: "Wow! Your IQ just got you an awesome deal",
        },
        subtitle: "test subtitle",
        auto: {
          subtitle: "",
          title: "",
        },
        title: "75% Off on first 2 items",
      },
      rule: [
        {
          max: 0,
          min: 2000,
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
        user_id: mobileNumber ? [mobileNumber] : [],
        brand_id: [Number(brandId)],
      },
      ownership: {
        payable_category: "seller",
        payable_by: "12435",
      },
      _schedule: {
        duration: null,
        end: endDate.toISOString(),
        next_schedule: [
          {
            start: "2019-10-18T08:35:39.000Z",
            end: endDate.toISOString(),
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
      coupon_prefix: couponPrefix,
      restrictions: {
        uses: {
          remaining: {
            app: -1,
            total: -1,
            user: -1,
          },
          maximum: {
            app: 2,
            total: 2,
            user: 2,
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

    // If mobileNumber is provided, create coupon via Boltic workflow
    if (mobileNumber) {
      console.log(
        `[AdminController] Creating coupon via Boltic workflow for user: ${mobileNumber}`
      );
      const workflowResponse = await boltic.createCouponViaBoltic(
        couponCode,
        mobileNumber,
        couponPayload
      );

      // Store coupon template in database
      const coupon: CouponTemplate = {
        id: generateId(),
        brandId,
        couponPrefix,
        discountPercentage: req.body.discountPercentage || 0,
        validityDays,
        rarityPercentage: req.body.rarityPercentage || 50,
        redeemUrl: req.body.redeemUrl || "",
        terms: req.body.terms || "",
        createdAt: Date.now(),
      };

      await boltic.insertCoupon(coupon);

      res.json({
        success: true,
        coupon,
        couponCode,
        workflowResponse,
      });
    } else {
      // No mobile number, just create template
      const coupon: CouponTemplate = {
        id: generateId(),
        brandId,
        couponPrefix,
        discountPercentage: req.body.discountPercentage || 0,
        validityDays,
        rarityPercentage: req.body.rarityPercentage || 50,
        redeemUrl: req.body.redeemUrl || "",
        terms: req.body.terms || "",
        createdAt: Date.now(),
      };

      await boltic.insertCoupon(coupon);
      res.json({
        success: true,
        coupon,
        payload: couponPayload,
      });
    }
  } catch (err) {
    console.error("Create Coupon Error:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Expects partial CouponTemplate

    const success = await boltic.updateCoupon(id, updates);
    if (!success) {
      res.status(404).json({ error: "Coupon not found or failed to update" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Update Coupon Error:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await boltic.deleteCoupon(id);
    if (!success) {
      res.status(404).json({ error: "Coupon not found or failed to delete" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Coupon Error:", err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};
