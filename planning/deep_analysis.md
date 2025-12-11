# Deep Coherency & Gap Analysis

## 1. Revised Scope: "Exit Intent Gamification"
Based on the latest user constraints, the system is narrowed to:
*   **Tenant**: Single Company, Single Store.
*   **Core Flow**: User attempts to leave site -> Check Cart -> Trigger Game Popup.
*   **Goal**: Functional "Good Working Version".

## 2. Coherency Check

### A. The "Exit Intent" Disconnect
*   **Current State**: The system has a backend workflow for "Abandoned Cart" (Server-side, likely triggered by webhook *after* some delay).
*   **User Goal**: "Popup... when user tries to quit".
*   **Gap**: This requires **Client-Side** logic (JavaScript in the browser), not just a Server-Side webhook.
*   **Findings**:
    *   `extension/` contains a standard FDK application (Backend + Admin UI).
    *   **Missing**: No "Theme Extension" or "Injector Script" found in the codebase to handle the browser `mouseleave` event.
    *   **Boltic Workflow**: The `Abandoned Cart Trigger.json` is useful for *email/SMS follow-up*, but **too slow** for an instant popup.

### B. Cart Verification Strategy
*   **Current**: `webhookController.ts` listens for `cart.update`.
*   **Needed**: The client-side script needs to know immediate cart status.
    *   *Option A*: Use Fynd Storefront SDK in the injected script to check `Fynd.cart.hasItems()`.
    *   *Option B*: Backend API check (slower).
*   **Recommendation**: Use Option A (Client-side check) for instant feedback.

### C. Game Architecture
*   **Current**: `gameController.ts` expects a `userId`.
*   **Gap**: On the storefront (before login), the user might be **Guest**.
    *   Does the Game support Guest triggers?
    *   Backend `startGame` creates a mock user if missing.
    *   *Risk*: If we rely on `fyndUserId`, we need to ensure the script can retrieve it from the storefront context.

### D. Reward Redemption
*   **Current**: Backend generates a coupon and stores it.
*   **Gap**: How does the user *get* the code in the popup?
    *   `gameController.ts` returns `reward` object.
    *   Frontend needs to display this clearly.
    *   *Integration*: Users might want to "Auto Apply" the coupon to the cart. Currently, they just get a code.

## 3. Structural Inconsistencies

| Component | Current Implementation | Required for "Exit Intent" | Severity |
| :--- | :--- | :--- | :--- |
| **Trigger** | Webhook (Async) | `window.onmouseleave` (Sync) | **Critical** |
| **Frontend** | React App (Standalone) | Embedded IFrame / Modal | **High** |
| **Auth** | Mock / Header-based | Guest / Token-less | **Medium** |
| **Theme** | N/A | Script Injection | **Critical** |

## 4. Proposed Solution Path (The "Hackathon Fix")

To achieve the "Good Working Version" with minimal friction:

1.  **Manual Script Injection**:
    *   Create a simple `loader.js` file.
    *   User manually adds this to their Fynd Store Platform > Theme > Edit Code > `theme.liquid` (or equivalent header).
    *   Script logic:
        ```javascript
        document.addEventListener('mouseleave', () => {
           if (Fynd.cart.item_count > 0 && !sessionStorage.getItem('gamePlayed')) {
               iframe.src = "https://our-app.com/game/sandfall?mode=popup";
               document.body.appendChild(iframe);
           }
        });
        ```

2.  **Frontend "Popup Mode"**:
    *   Modify `/frontend` to support a `?mode=popup` query param that hides the heavy dashboard and just shows the Game + Reward Card.

3.  **Backend "Guest Mode"**:
    *   Ensure `startGame` accepts a temporary `guestId` if real login isn't available.

## 5. Decision Points (Questionnaire Prep)
We need to resolve exactly how to inject the script and how to handle guest users.
