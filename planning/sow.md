# Statement of Work (SOW)

## Problem Statement

Commerce brands on Fynd struggle to convert new visitors and recover abandoned carts efficiently. The proposed solution is a standalone promotional gaming platform that integrates with Fynd Commerce and Boltic (data/automation + full serverless compute) to offer skill/strategy-forward, transparent games that award exclusive, margin-safe discounts—improving acquisition, engagement, and conversion without eroding trust.

## Objectives

- Increase new customer acquisition through engaging, transparent games.
- Recover abandoned carts via targeted, skill-based game flows with instant discounts.
- Drive repeat engagement with leaderboards, streaks, and daily challenges.
- Protect seller margins with configurable reward caps and eligibility rules.
- Maintain user trust via clear odds, anti-rigging safeguards, and verifiable wins.

## Scope

In-scope (MVP):

- Standalone web platform (React/TypeScript) hosting four games: Spin Wheel, Scratch Card, Quiz, Pattern Match.
- Reward system: coins, coupons, leaderboards (weekly), rarity/odds display, win limits.
- Fynd integration: cart/order hooks, coupon generation; cart-abandonment game triggers.
- Boltic integration: Tables (state, leaderboards), Workflows (automation), Gateway/HTTP functions for serverless APIs, and Boltic Compute/Serverless (https://docs.boltic.io/compute/serverless/) to host both backend functions and static frontend
- Seller admin basics: enable/disable games, reward caps, cart-abandonment thresholds, notification templates, analytics overview.
- Security/anti-cheat, JWT auth, webhook validation, rate limiting.

Additional things if time persists:

- Full Fynd Extension/embedded iframe.
- Native mobile apps.
- Social features (friend challenges/shares).
- Advanced ML personalization or blockchain rewards.

## Deliverables

- Functional standalone web app with 4 games and responsive UX.
- Backend APIs (serverless via Boltic Gateway/Workflows) for game sessions, rewards, coupons, leaderboards.
- Boltic Tables schemas for users, sessions, leaderboards, rewards, cart-abandonment tracking.
- Boltic Workflows for cart-abandonment detection, game completion handling, weekly leaderboard finalization, daily maintenance.
- Fynd integration: webhook listeners (cart/order), coupon creation flow, cart-return redirect.
- Seller admin panel (MVP configuration + analytics snapshot).
- Security controls: JWT validation, webhook signature checks, anti-cheat score validation, rate limits.
- Deployment pipeline: Boltic serverless/compute for backend functions and static frontend; Vercel as optional fallback for frontend and Railway as fallback for backend if Boltic gaps arise.
- Documentation: setup/runbook, API reference (summary), admin usage guide, testing checklist.

## Assumptions & Dependencies

- Fynd Partner access with API keys and webhook configuration capability.
- Boltic workspace with access to Tables, Workflows, Gateway/serverless, Storage, and Compute/Serverless hosting (frontend + backend); confirm deploy size/timeouts/concurrency with Boltic.
- Frontend primarily hosted on Boltic serverless (static) with Vercel as fallback; domain provisioned.
- Redis (or equivalent) optional for caching if Boltic latency requires.
- Legal/brand approvals for user communications and odds disclosure.

## Roles & Responsibilities

- Client: Provide Fynd/Boltic credentials, domain/DNS, branding assets, approve reward/margin policies, notification templates.
- Development: Design, build, test, and deploy the platform; configure Boltic and Fynd integrations; provide admin guide and handoff.
- Shared: UAT, go-live checklist, monitoring setup, incident response runbook.

## Timeline

- Day 1: Finalize scope, UX wireflows, repos/CI; scaffold React frontend and Boltic serverless backend.
- Day 2: Build core games (Spin, Scratch, Quiz, Pattern) and coin economy; local playthroughs.
- Day 3: Fynd integration (cart webhooks, coupons); Boltic Tables schemas; auth/JWT and session plumbing.
- Day 4: Boltic Workflows (cart-abandonment, game completion), Gateway endpoints, anti-cheat/validation; hook up leaderboard basics.
- Day 5: Polish & demo: seller admin MVP (toggles/caps), notifications, QA hardening, deploy to Boltic serverless (frontend + backend), fallback smoke tests (Vercel/Railway if needed), mentor/demo review.

## Acceptance Criteria

- All four games playable with documented odds/rarity where applicable.
- Coupons generated within seller-defined caps; min cart and expiry enforced; single-use per user.
- Cart-abandonment trigger works at configurable threshold and routes back to checkout with applied coupon.
- Leaderboard resets weekly; win limits enforced across games; rewards distributed per spec.
- Admin panel updates take effect without code changes for core configs (thresholds, caps, toggles).
- Security: JWT/session validation, webhook signature checks, anti-cheat score validation, rate limiting in place.
- Deployments operational in target environments (Boltic serverless/compute for frontend + backend via Gateway/Workflows; Vercel/Railway fallbacks validated).

## Risks & Mitigations

- Reward abuse/rigging perception → Mitigation: transparent odds, anti-cheat, win limits, published winner logs.
- Seller margin erosion → Mitigation: hard caps, min cart values, percentile-based discounts bounded by config.
