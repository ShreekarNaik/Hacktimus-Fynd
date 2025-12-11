
import { Router } from 'express';
import { 
  login, 
  getBrands, createBrand, updateBrand, deleteBrand,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
} from '../controllers/adminController';

const router = Router();

// Auth
router.post('/auth/login', login);

// Brands
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
