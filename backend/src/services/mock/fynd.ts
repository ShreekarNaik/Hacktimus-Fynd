import { db } from './db';
import { IFyndService } from '../interfaces';

export class MockFyndService implements IFyndService {
  
  // Simulate creating a coupon on Fynd Platform
  async createCoupon(userId: string, discountPercent: number, expiryHours: number = 48) {
    const code = `WIN${discountPercent}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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
