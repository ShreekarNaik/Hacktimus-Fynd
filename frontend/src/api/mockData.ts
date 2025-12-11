
export const MOCK_USER = {
  userId: "DemoUser", // This acts as the Display Name / Username
  phoneNumber: "9876543210",
  coinsBalance: 1250,
  totalWins: 18,
  preferredStores: ["Nike", "Amazon"]
};

// Simulating a DB for Username uniqueness check
export const MOCK_USERS_DB = [
    { username: "DemoUser", phoneNumber: "9876543210" },
    { username: "ProGamer", phoneNumber: "1234567890" }
];

export const MOCK_REWARDS = [
  {
    company: "Nike",
    discountPercentage: 25,
    couponCode: "SAVE25-DEMO",
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), // +7 days
    redeemUrl: "https://www.nike.com/in/",
    terms: "Valid only on footwear. Not applicable on discounted items. One time use only."
  },
  {
    company: "Starbucks",
    discountPercentage: 10,
    couponCode: "WELCOME-10",
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), // +30 days
    redeemUrl: "https://www.starbucks.in/",
    terms: "Valid on tall beverages. Cannot be clubbed with other offers."
  }
];

export const MOCK_PENDING_REWARDS = [
  {
    gameName: "sandfall",
    timestamp: Date.now(),
    company: "H&M",
    redeemUrl: "https://www2.hm.com/en_in/index.html",
    terms: "Flat 20% off on your next purchase. Valid for online orders only."
  }
];

export const MOCK_LEADERBOARD = {
  sandfall: [
    { userId: "DemoUser", gameName: "sandfall", score: 8500, weekNumber: 1, timestamp: Date.now() },
    { userId: "ProGamer99", gameName: "sandfall", score: 8200, weekNumber: 1, timestamp: Date.now() - 10000 },
    { userId: "NoobMaster", gameName: "sandfall", score: 5000, weekNumber: 1, timestamp: Date.now() - 50000 },
  ],
  spin: [
    { userId: "LuckySpinner", gameName: "spin", score: 1000, weekNumber: 1, timestamp: Date.now() },
    { userId: "DemoUser", gameName: "spin", score: 500, weekNumber: 1, timestamp: Date.now() - 10000 },
  ],
  scratch: [
    { userId: "ScratchKing", gameName: "scratch", score: 1000, weekNumber: 1, timestamp: Date.now() },
  ],
  quiz: [
    { userId: "Brainiac", gameName: "quiz", score: 100, weekNumber: 1, timestamp: Date.now() },
    { userId: "DemoUser", gameName: "quiz", score: 80, weekNumber: 1, timestamp: Date.now() - 10000 },
  ]
};

export const MOCK_ID_TOKEN = "mock-demo-mode-token-jwt-123456";

// Admin Mock Data
export const MOCK_ADMIN_USER = {
  username: "admin"
};

export const MOCK_ADMIN_TOKEN = "mock-admin-token-jwt-789";

export const MOCK_COMPANIES = [
  { id: "1", name: "Nike", createdAt: new Date().toISOString() },
  { id: "2", name: "Starbucks", createdAt: new Date().toISOString() },
  { id: "3", name: "H&M", createdAt: new Date().toISOString() },
  { id: "4", name: "Amazon", createdAt: new Date().toISOString() }
];

export const MOCK_COUPON_TEMPLATES = [
  {
    id: "c1",
    companyId: "1",
    couponPrefix: "NIKE",
    validityDays: 30,
    rarityPercentage: 20,
    discountPercentage: 25,
    redeemUrl: "https://www.nike.com/in/",
    terms: "Valid only on footwear. Not applicable on discounted items. One time use only.",
    createdAt: new Date().toISOString()
  },
  {
    id: "c2",
    companyId: "2",
    couponPrefix: "COFFEE",
    validityDays: 7,
    rarityPercentage: 60,
    discountPercentage: 10,
    redeemUrl: "https://www.starbucks.in/",
    terms: "Valid on tall beverages. Cannot be clubbed with other offers.",
    createdAt: new Date().toISOString()
  },
  {
    id: "c3",
    companyId: "3",
    couponPrefix: "FASHION",
    validityDays: 14,
    rarityPercentage: 40,
    discountPercentage: 20,
    redeemUrl: "https://www2.hm.com/en_in/index.html",
    terms: "Flat 20% off on your next purchase. Valid for online orders only.",
    createdAt: new Date().toISOString()
  }
];
