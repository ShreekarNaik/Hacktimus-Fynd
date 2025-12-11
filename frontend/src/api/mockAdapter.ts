import type { AxiosResponse, AxiosAdapter } from 'axios';
import { MOCK_USER, MOCK_REWARDS, MOCK_PENDING_REWARDS, MOCK_LEADERBOARD, MOCK_ID_TOKEN, MOCK_USERS_DB, MOCK_ADMIN_USER, MOCK_ADMIN_TOKEN, MOCK_COMPANIES, MOCK_COUPON_TEMPLATES } from './mockData';
import type { Company, CouponTemplate } from '../types';

const NETWORK_DELAY = 500;

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory stores for CRUD operations
let companiesStore: Company[] = [...MOCK_COMPANIES];
let couponsStore: CouponTemplate[] = [...MOCK_COUPON_TEMPLATES];

const mockAdapter: AxiosAdapter = async (config) => {
  await delay(NETWORK_DELAY);

  const { url, method, data } = config;
  const methodUpper = method?.toUpperCase();
  const parsedData = data ? JSON.parse(data) : {};

  console.log(`[Demo Mock] ${methodUpper} ${url}`, parsedData);

  let status = 200;
  let responseData: any = {};

  // --- ADMIN AUTH ROUTES ---
  if (url === '/admin/auth/login' && methodUpper === 'POST') {
    const { username, password } = parsedData;
    if (username === 'admin' && password === 'admin') {
      responseData = { token: MOCK_ADMIN_TOKEN, admin: MOCK_ADMIN_USER };
    } else {
      status = 401;
      responseData = { error: 'Invalid credentials' };
    }
  } else if (url === '/admin/auth/logout' && methodUpper === 'POST') {
    responseData = { success: true };
  }
  
  // --- ADMIN COMPANY ROUTES ---
  else if (url === '/admin/companies' && methodUpper === 'GET') {
    responseData = companiesStore;
  } else if (url === '/admin/companies' && methodUpper === 'POST') {
    const newCompany: Company = {
      id: `${Date.now()}`,
      name: parsedData.name,
      createdAt: new Date().toISOString()
    };
    companiesStore.push(newCompany);
    responseData = newCompany;
  } else if (url?.startsWith('/admin/companies/') && methodUpper === 'PUT') {
    const id = url.split('/').pop();
    const index = companiesStore.findIndex(c => c.id === id);
    if (index !== -1) {
      companiesStore[index] = { ...companiesStore[index], ...parsedData };
      responseData = companiesStore[index];
    } else {
      status = 404;
      responseData = { error: 'Company not found' };
    }
  } else if (url?.startsWith('/admin/companies/') && methodUpper === 'DELETE') {
    const id = url.split('/').pop();
    companiesStore = companiesStore.filter(c => c.id !== id);
    responseData = { success: true };
  }
  
  // --- ADMIN COUPON ROUTES ---
  else if (url === '/admin/coupons' && methodUpper === 'GET') {
    responseData = couponsStore;
  } else if (url === '/admin/coupons' && methodUpper === 'POST') {
    const newCoupon: CouponTemplate = {
      id: `c${Date.now()}`,
      ...parsedData,
      createdAt: new Date().toISOString()
    };
    couponsStore.push(newCoupon);
    responseData = newCoupon;
  } else if (url?.startsWith('/admin/coupons/') && methodUpper === 'PUT') {
    const id = url.split('/').pop();
    const index = couponsStore.findIndex(c => c.id === id);
    if (index !== -1) {
      couponsStore[index] = { ...couponsStore[index], ...parsedData };
      responseData = couponsStore[index];
    } else {
      status = 404;
      responseData = { error: 'Coupon not found' };
    }
  } else if (url?.startsWith('/admin/coupons/') && methodUpper === 'DELETE') {
    const id = url.split('/').pop();
    couponsStore = couponsStore.filter(c => c.id !== id);
    responseData = { success: true };
  }

  // --- AUTH ROUTES ---
  else if (url === '/auth/login' && methodUpper === 'POST') {
    // Legacy support or direct password mock if needed (skipping for now based on plan)
    responseData = { token: MOCK_ID_TOKEN, user: MOCK_USER };
  } else if (url === '/auth/register' && methodUpper === 'POST') {
      const { phoneNumber, username, otp } = parsedData;
      
      // Check Uniqueness
      const existingUser = (MOCK_USERS_DB as any[]).find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUser) {
          status = 400;
          responseData = { error: "Username taken, please choose another" };
      } else {
          responseData = {
              token: MOCK_ID_TOKEN,
              user: { ...MOCK_USER, userId: username, phoneNumber } 
          };
      }
  } else if (url === '/auth/send-otp' && methodUpper === 'POST') {
      // Allow any phone for now
                responseData = { success: true, message: "OTP sent (Mock)" };
  } else if (url === '/auth/login-otp' && methodUpper === 'POST') {
      const { phoneNumber, otp } = parsedData;
      
      // Find user by Phone
      const foundUser = (MOCK_USERS_DB as any[]).find(u => u.phoneNumber === phoneNumber);
      
      if (foundUser) {
          responseData = {
              token: MOCK_ID_TOKEN,
              user: { ...MOCK_USER, userId: foundUser.username, phoneNumber: foundUser.phoneNumber }
          };
      } else {
          // If trying to login but phone not found
          status = 404;
          responseData = { error: "User not found. Please Sign Up." };
      }
  } else if (url === '/user/delete' && methodUpper === 'POST') {
      responseData = { success: true };
  }
  
  // --- USER ROUTES ---
  else if (url?.startsWith('/user/') && methodUpper === 'GET') {
      // /user/:id or /user/profile
      if (url.includes('/profile')) {
          responseData = {
              ...MOCK_USER,
              rewards: MOCK_REWARDS
          };
      } else {
          // /user/:userId
          responseData = MOCK_USER;
      }
  } else if (url === '/user/profile' && methodUpper === 'PUT') {
      responseData = {
          success: true,
          user: { ...MOCK_USER, ...parsedData }
      };
  }
  
  // --- GAME ROUTES ---
  else if (url === '/games/start' && methodUpper === 'POST') {
    responseData = { sessionId: `mock-session-${Date.now()}` };
  } else if (url === '/games/submit' && methodUpper === 'POST') {
    responseData = { 
        success: true, 
        earnedCoins: 50, 
        message: "Score submitted (Mock)" 
    };
  } else if (url?.startsWith('/games/leaderboard/') && methodUpper === 'GET') {
      const gameName = url.split('/').pop() || 'sandfall';
      responseData = (MOCK_LEADERBOARD as any)[gameName] || [];
  } else if (url?.includes('/games/pending-rewards') && methodUpper === 'GET') {
      responseData = MOCK_PENDING_REWARDS;
  } else if (url === '/games/claim-leaderboard' && methodUpper === 'POST') {
      responseData = {
          success: true,
          reward: {
              couponCode: `DEMO-WIN-${Date.now()}`,
              discountPercentage: 50
          }
      };
  }
  
  else {
    status = 404;
    responseData = { error: 'Not Found (Mock)' };
    console.warn(`[Demo Mock] Unhandled Request: ${methodUpper} ${url}`);
  }

  const response: AxiosResponse = {
    data: responseData,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config,
    request: {}
  };

  return response;
};

export default mockAdapter;
