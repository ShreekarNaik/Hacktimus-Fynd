# Fynd Promotional Games Platform - Backend

Backend API for the promotional games platform using **Boltic Tables** for database management.

## 🎯 Overview

This backend provides REST APIs for:
- User authentication and management
- Game session tracking
- Leaderboard management  
- Rewards distribution
- Cart abandonment recovery via webhooks

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

The `.env` file is already configured with:
- `BOLTIC_API_KEY` - Your Boltic API key
- `BOLTIC_REGION` - asia-south1
- Other configuration variables

### 3. Create Boltic Tables

**Run the helper script to see table creation instructions:**

```bash
pnpm run tables:help
```

This will display formatted instructions with AI prompts for creating all 5 tables in the Boltic Console.

**Or manually:**
1. Open https://asia-south1.console.boltic.io/
2. Navigate to Tables
3. Create the 5 tables using AI prompts (see `dev_docs.md` or run `pnpm run tables:help`)

### 4. Test Boltic Connection

```bash
pnpm run test:boltic
```

This will verify:
- ✅ Boltic SDK connection
- ✅ Tables are accessible
- ✅ CRUD operations work

### 5. Start Development Server

```bash
pnpm run dev
```

Server will start on `http://localhost:3000`

## 📚 Documentation

- **[BOLTIC_SETUP_SUMMARY.md](./BOLTIC_SETUP_SUMMARY.md)** - Complete setup guide and status
- **[dev_docs.md](./dev_docs.md)** - Comprehensive technical documentation
  - Table schemas
  - API usage examples
  - SDK integration patterns
  - Troubleshooting

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Build TypeScript to JavaScript |
| `pnpm run start` | Run production server |
| `pnpm run tables:help` | Display table creation guide |
| `pnpm run test:boltic` | Test Boltic connection and operations |

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── gameController.ts
│   │   ├── userController.ts
│   │   └── webhookController.ts
│   ├── services/          # Business logic
│   │   ├── bolticService.ts   # 🆕 Real Boltic integration
│   │   ├── interfaces.ts
│   │   └── mock/              # Mock services (old)
│   ├── routes/            # API routes
│   ├── models/            # TypeScript types
│   ├── middleware/        # Express middleware
│   ├── test-boltic.ts     # 🆕 Boltic test script
│   └── index.ts           # App entry point
├── scripts/
│   └── create-tables-help.js  # 🆕 Table creation helper
├── .env                   # 🆕 Environment variables
├── dev_docs.md            # 🆕 Technical documentation
├── BOLTIC_SETUP_SUMMARY.md # 🆕 Setup summary
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (password: "test123")

### Games
- `POST /api/games/complete` - Submit game completion
- `GET /api/games/leaderboard/:gameName` - Get leaderboard
- `POST /api/games/claim-reward` - Claim leaderboard reward

### User
- `GET /api/user/profile/:userId` - Get user profile
- `GET /api/user/rewards/:userId` - Get user rewards

### Webhooks
- `POST /api/webhooks/cart` - Fynd cart webhook
- `POST /api/webhooks/cart-recovery` - Cart recovery game completion

## 🔧 Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js v5
- **Database:** Boltic Tables (PostgreSQL-compatible)
- **SDK:** @boltic/sdk v0.0.7
- **Dev Tools:** nodemon, tsx, ts-node

## 🎮 Game Integration

Games send completion data to:
```typescript
POST /api/games/complete
{
  userId: string;
  gameName: 'scratch-card' | 'spin' | 'quiz' | 'sandfall';
  score: number;
  isCartRecovery?: boolean;
  cartId?: string;
}
```

## 🏆 Leaderboard System

- Weekly leaderboards per game
- Top 10 players tracked
- Rewards distributed based on ranking
- Real-time updates via Boltic Tables

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles and stats |
| `game_sessions` | Game completion records |
| `leaderboard` | Weekly game rankings |
| `rewards` | Coupon rewards earned |
| `cart_abandonments` | Abandoned cart tracking |

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `.env` file exists
- Run `pnpm install`

### Boltic connection issues
- Verify `BOLTIC_API_KEY` in `.env`
- Check tables are created in console
- Run `pnpm run test:boltic`

### TypeScript errors
- Run `pnpm run build` to check compilation
- Check for missing type definitions

## 🎯 For Development

**This is a hackathon POC** - focus is on:
- ✅ Working functionality
- ✅ Real database integration (not mocks)
- ✅ Clean, maintainable code
- ✅ Good practices without over-engineering

## 📝 Notes

- **API Key Security:** The `.env` file is gitignored - don't commit credentials
- **Mock Fallback:** If Boltic SDK doesn't support tables.sql yet, queries are logged but not executed
- **Direct API:** See `dev_docs.md` for HTTP API fallback implementation
- **Testing:** Use browser dev tools for frontend testing, or tools like Postman for API testing

## 🚦 Status

✅ **Ready for development**

- [x] Boltic SDK installed and configured
- [x] Service layer implemented
- [x] Controllers updated
- [x] Environment configured
- [x] Documentation complete
- [ ] **Tables need to be created in Boltic Console** (run `pnpm run tables:help`)

## 🤝 Contributing

For hackathon team members:

1. Keep the focus on core functionality
2. Use the service layer (`bolticService.ts`) for all DB operations
3. Don't hardcode - use environment variables
4. Log errors for debugging
5. Update `dev_docs.md` if you add new features

## 📞 Support

Check the documentation:
- Questions about setup? → `BOLTIC_SETUP_SUMMARY.md`
- Need API details? → `dev_docs.md`
- Table creation? → `pnpm run tables:help`

---

**Made with ⚡ for Hacktimus Fynd**
