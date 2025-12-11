# Current State Analysis: Hacktimus-Fynd

## 1. System Overview
The system is a Gamification & Customer Retention platform designed for Fynd commerce sites. It consists of three main subsystems:
1.  **Fynd Platform Extension**: Installs onto a merchant's company account, handles configuration, and likely injects script tags or serves the admin interface.
2.  **Gamification Backend (Node.js/Express)**: Manages game sessions, scoring, rewards, and integrates with Boltic (for data/workflows) and Fynd (for coupons).
3.  **Gamification Frontend (React/Vite)**: The player-facing interface for playing games, viewing leaderboards, and claiming rewards.
4.  **Admin Panel**: Integrated partly into the frontend/extension for merchants to configure games and rewards.

## 2. Component Architecture

### A. Backend (`/backend`)
*   **Tech Stack**: Node.js, Express, TypeScript, pnpm.
*   **Core Responsibility**: Game logic, score validation, reward generation, data persistence.
*   **Services**:
    *   `BolticService`: Wrapper around `@boltic/sdk` for Tables (db) and generic SQL execution.
    *   `Mock Services`: Extensive use of in-memory mocks (`db`, `fynd`) for development speed.
*   **Data Models** (inferred from `types.ts` & `BolticService`):
    *   `User`: `userId`, `fyndUserId`, `coinsBalance`, stats.
    *   `GameSession`: `sessionId`, `score`, `coinsEarned`, `isCartRecovery`.
    *   `Leaderboard`: `gameName`, `score`, `weekNumber`.
    *   `Reward`: `rewardId`, `couponCode`, `rewardTier`, `redeemed`.
*   **API Routes**:
    *   `/api/games/start`: Initialize session.
    *   `/api/games/submit`: Post score, calc coins, trigger rewards.
    *   `/api/webhooks/fynd/cart`: Listener for cart events (abandonment triggers).

### B. Frontend (`/frontend`)
*   **Tech Stack**: React 19, Vite, TailwindCSS, Framer Motion.
*   **Core Responsibility**: User interface for games and player dashboard.
*   **Modes**:
    *   **Live**: Connects to `localhost:3000/api`.
    *   **Demo**: `VITE_USE_DEMO=true` triggers `client.ts` to use `mockAdapter`. This completely bypasses the backend for UI dev.
*   **Key Pages**: `Dashboard`, `Login`, `Profile`, `Leaderboard`, `AdminDashboard`.
*   **Games**: `Sandfall`, `Spin`, `Scratch`, `Quiz` (referenced in code).

### C. Extension (`/extension/FyndGames-Gamify-Coupons`)
*   **Tech Stack**: Node.js (FDK Extension SDK), SQLite (session storage).
*   **Core Responsibility**: Integration point with Fynd Platform.
*   **Lifecycle**:
    *   Auth: Handles OAuth handshake with Fynd (`setupFdk`).
    *   Serve: Serves a static React app (`frontend/public/dist`) as the extension UI within the Fynd Platform.
    *   Webhooks: listening for generic platform events (`company/product/delete` configured as example).
*   **Frontend**: Contains its own React app in `extension/.../frontend` (separate from the main `/frontend`).

## 3. Data Flow & Integration Points

### User Flow (Inferred)
1.  **Trigger**: User performs action (or abandons cart) on E-commerce site.
2.  **Engagement**: User is presented with a "Game" popup.
3.  **Play**: User logs in (AuthContext), plays game (Frontend).
4.  **Result**: Score submitted to Backend.
5.  **Reward**:
    *   Backend checks eligibility.
    *   Calls Fynd API (mocked) to generate Coupon.
    *   Saves Reward to Boltic Table.
    *   Returns reward to Frontend.

### Data Storage
*   **Primary**: Boltic Tables (`users`, `game_sessions`, `rewards`, `leaderboard`).
*   **Session**: SQLite (in Extension only, for FDK sessions).
*   **Dev/Test**: heavily reliant on `src/services/mock/db.ts` and `mockAdapter.ts`.

## 4. Current Status & Observations
1.  **Hybrid State**: The project is split between a "Real" implementation (BolticService) and a "Mock" implementation (used by Demo mode and partly by backend controllers).
2.  **Boltic Integration**: `BolticService` is written but usage in `gameController` is mixed (writes to both `db` mock and `boltic` real service).
3.  **Admin Panel**: There is a `Temporary Admin Control Panel` node in the graph, likely mapping to `/frontend/src/pages/AdminDashboard.tsx`.
4.  **Workflows**: 
    - **Status**: Implemented as Boltic Workflows (exported in `boltic-workflow-exports/`).
    - **Abandoned Cart Trigger**:
        - **Trigger**: Fynd Platform Webhook (`cart.update`).
        - **Flow**: Logs webhook -> Stores state -> Waits (Sleep) -> Fetches Cart again -> Checks if purchased (Cart Value) -> If abandoned, posts to backend (`localhost:3000`) -> Generates SMS -> Sends SMS via Boltic -> Logs to `cart_abandonments` table.
    - **Create User**:
        - **Trigger**: Fynd Platform Webhook (`user.create`).
        - **Flow**: Extract user info -> Write to `users` table in Boltic.
    - **Make Coupon**:
        - **Trigger**: HTTP Webhook (likely from Game Backend).
        - **Flow**: Check validity -> List records (tables) -> Create Coupon (Fynd Platform) -> Personalize Message -> Send SMS (Boltic).

5.  **Extension Logic**: The extension server `server.js` is quite basic; mostly boilerplate FDK setup. The logic for "Triggering popup" on the e-commerce site isn't explicitly visible in the backend/frontend code yet—likely intended to be script-injected or handled by the extension's frontend assets.

## 5. Next Steps (Pending Confirmation)
*   Standardize reliance on Boltic vs Mocks.
*   Clarify the mechanism for injecting the Game popup into the E-commerce site (the `edges` for "Integrates popup game trigger").
*   Verify the Boltic Workflow triggers.

**Waiting for user confirmation to proceed to Deep Analysis.**
