import { db } from './db';
import { IFyndService } from '../interfaces';

export class MockFyndService implements IFyndService {
  
  // Simulate creating a coupon on Fynd Platform
  async createCoupon(userId: string, discountPercent: number, expiryHours: number = 48) {
    // Make a complex, unguessable code using basic random for mock (can use crypto in real app)
    // Format: WIN<Discount>_<RANDOM_HASH>
    // e.g. WIN50_8A29F1C...
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase() + 
                 Math.random().toString(36).substring(2, 10).toUpperCase();
                 
    const code = `WIN${discountPercent}_${hash}`;
    console.log(`[MockFynd] Creating Coupon: Code=${code}, User=${userId}, Discount=${discountPercent}%`);
    return {
      code,
      discount_value: { unit: 'percentage', value: discountPercent },
      validity: {
        end: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
      },
      _custom_json: {
        generated_via: 'hacktimus-games'
      }
    };
  }

  // Simulate fetching Cart
  async getCart(cartId: string) {
    const cart = db.carts[cartId];
    if (cart) return cart;
    
    // Fallback Mock
    return {
      id: cartId,
      items: [
        { item_id: 1, name: 'Mock Item 1', price: 1000, quantity: 1 }
      ],
      coupon_text: ''
    };
  }

  // Simulate applying coupon to cart
  async applyCoupon(cartId: string, couponCode: string) {
    console.log(`[MockFynd] Applying coupon ${couponCode} to cart ${cartId}`);
    return { success: true, message: 'Coupon applied successfully' };
  }
}

export const fynd = new MockFyndService();
