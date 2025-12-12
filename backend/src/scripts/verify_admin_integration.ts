
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the parent directory's .env if running from scripts/
// or just look in current directory.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Request } from 'express';
import { 
  login, 
  createBrand, 
  getBrands, 
  deleteBrand,
  createCoupon,
  getCoupons,
  deleteCoupon
} from '../controllers/adminController';

const mockReq = (body: any = {}, params: any = {}) => ({
  body,
  params
} as Request);

const mockRes = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.data = data;
    return res;
  };
  return res;
};

async function verify() {
  console.log('--- Verifying Admin Integration (REAL BOLTIC DB) ---');

  if (!process.env.BOLTIC_API_KEY) {
    console.error('❌ BOLTIC_API_KEY is missing from .env');
    process.exit(1);
  }

  // 1. Test Login
  console.log('\n1. Testing Login...');
  const resLogin = mockRes();
  await login(mockReq({ username: 'admin', password: 'admin' }), resLogin);
  
  if (resLogin.data && resLogin.data.token) {
    console.log('✅ Login Successful');
  } else {
    console.error('❌ Login Failed:', resLogin.data);
    return;
  }

  // variables to store created ids
  let createdBrandId: string | null = null;
  let createdCouponId: string | null = null;
  const uniqueSuffix = Date.now();

  try {
    // 2. Test Brand Creation
    console.log('\n2. Testing Create Brand (Real DB Write)...');
    const brandName = `Test Brand ${uniqueSuffix}`;
    const resCreateBrand = mockRes();
    await createBrand(mockReq({ name: brandName }), resCreateBrand);
    
    if (resCreateBrand.data && resCreateBrand.data.id) {
      createdBrandId = resCreateBrand.data.id;
      console.log(`✅ Brand Created: ${brandName} (ID: ${createdBrandId})`);
    } else {
      throw new Error(`Failed to create brand: ${JSON.stringify(resCreateBrand.data)}`);
    }

    // 3. Test Get Brands
    console.log('\n3. Testing Get Brands...');
    const resGetBrands = mockRes();
    await getBrands(mockReq(), resGetBrands);
    
    if (Array.isArray(resGetBrands.data)) {
      const found = resGetBrands.data.find((b: any) => b.id === createdBrandId);
      if (found) {
        console.log(`✅ Brand found in list: ${found.name}`);
      } else {
        console.warn('⚠️ Created brand NOT found in list immediately (might be eventual consistency or filter issue)');
      }
    } else {
      throw new Error('Failed to fetch brands list');
    }

    // 4. Test Coupon Creation
    console.log('\n4. Testing Create Coupon (Real DB Write)...');
    const resCreateCoupon = mockRes();
    await createCoupon(mockReq({
      brandId: createdBrandId,
      couponPrefix: `TEST${uniqueSuffix}`,
      discountPercentage: 15,
      validityDays: 7,
      rarityPercentage: 10,
      redeemUrl: 'https://example.com/redeem',
      terms: 'Test Terms'
    }), resCreateCoupon);

    if (resCreateCoupon.data && resCreateCoupon.data.id) {
      createdCouponId = resCreateCoupon.data.id;
      console.log(`✅ Coupon Created: TEST${uniqueSuffix} (ID: ${createdCouponId})`);
    } else {
      throw new Error(`Failed to create coupon: ${JSON.stringify(resCreateCoupon.data)}`);
    }

    // 5. Test Get Coupons
    console.log('\n5. Testing Get Coupons...');
    const resGetCoupons = mockRes();
    await getCoupons(mockReq(), resGetCoupons);

    if (Array.isArray(resGetCoupons.data)) {
      const found = resGetCoupons.data.find((c: any) => c.id === createdCouponId);
      if (found) {
        console.log(`✅ Coupon found in list: ${found.couponPrefix}`);
      } else {
        console.warn('⚠️ Created coupon NOT found in list immediately');
      }
    } else {
      throw new Error('Failed to fetch coupons list');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    // 6. Cleanup
    console.log('\n6. Cleaning up...');
    
    if (createdCouponId) {
       const resDelCoupon = mockRes();
       await deleteCoupon(mockReq({}, { id: createdCouponId }), resDelCoupon);
       if (resDelCoupon.data && resDelCoupon.data.success) {
         console.log('✅ Coupon Deleted');
       } else {
         console.error('❌ Failed to delete coupon');
       }
    }

    if (createdBrandId) {
      const resDelBrand = mockRes();
      await deleteBrand(mockReq({}, { id: createdBrandId }), resDelBrand);
      if (resDelBrand.data && resDelBrand.data.success) {
        console.log('✅ Brand Deleted');
      } else {
        console.error('❌ Failed to delete brand');
      }
    }
  }

  console.log('\n--- Verification Complete ---');
}

verify().catch(console.error);
