
import { Request, Response } from 'express';
import { boltic } from '../services/bolticService';
import { Brand, CouponTemplate } from '../models/types';
// Mock Admin Credentials
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin'
};

const generateId = () => require('crypto').randomUUID();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.json({
      token: `admin-jwt-${generateId()}`,
      admin: { username }
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
};

// ===== BRANDS =====

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await boltic.getBrands();
    res.json(brands);
  } catch (err) {
    console.error('Get Brands Error:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const brand: Brand = {
      id: generateId(),
      name,
      createdAt: Date.now()
    };

    await boltic.insertBrand(brand);
    res.json(brand);
  } catch (err) {
    console.error('Create Brand Error:', err);
    res.status(500).json({ error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const success = await boltic.updateBrand(id, name);
    if (!success) {
      res.status(404).json({ error: 'Brand not found or failed to update' });
      return;
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Update Brand Error:', err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await boltic.deleteBrand(id);
    if (!success) {
      res.status(404).json({ error: 'Brand not found or failed to delete' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Brand Error:', err);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
};

// ===== COUPONS =====

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await boltic.getCoupons();
    res.json(coupons);
  } catch (err) {
    console.error('Get Coupons Error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { brandId, couponPrefix } = req.body;
    if (!brandId || !couponPrefix) {
      res.status(400).json({ error: 'Brand and Prefix are required' });
      return;
    }

    const coupon: CouponTemplate = {
      id: generateId(),
      brandId,
      couponPrefix,
      discountPercentage: req.body.discountPercentage || 0,
      validityDays: req.body.validityDays || 30,
      rarityPercentage: req.body.rarityPercentage || 50,
      redeemUrl: req.body.redeemUrl || '',
      terms: req.body.terms || '',
      createdAt: Date.now()
    };

    await boltic.insertCoupon(coupon);
    res.json(coupon);
  } catch (err) {
    console.error('Create Coupon Error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Expects partial CouponTemplate

    const success = await boltic.updateCoupon(id, updates);
    if (!success) {
      res.status(404).json({ error: 'Coupon not found or failed to update' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Update Coupon Error:', err);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await boltic.deleteCoupon(id);
    if (!success) {
      res.status(404).json({ error: 'Coupon not found or failed to delete' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Coupon Error:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};
