# Mirage Royale

A mobile-first, real-time social deception and bizarre-trivia party game for 2–8 players. Everyone joins on their own device using a four-character room code.

## Play loop

1. The host opens a room; friends join from another device, browser tab, or invite link.
2. Players vote on a trivia category, then all write a fake answer and choose a 1× / 2× / 3× truth wager at the same time.
3. Player bluffs, the real answer, and a house decoy are shuffled into a suspect lineup. Players vote privately, cannot choose their own bluff, and can spend a once-per-match private Truth Radar to eliminate one fake card.
4. Round scoring declassifies card authors, reveals the fact, and updates the leaderboard. Three rounds end at the championship podium.

## Local preview

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Local preview uses a process-local store for convenience. Open the app in two separate browser contexts (one normal tab and one Incognito window) to test two devices.

## Vercel deployment

1. Push this folder to a Git repository, then import it into Vercel (or use Vercel's project import flow).
2. In Vercel, install an **Upstash Redis** Marketplace integration and connect it to this project. Confirm these server-side environment variables are available: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` and `KV_REST_API_TOKEN`).
3. Deploy. `npm run build` creates the Vite frontend and bundles the Node handler with its TypeScript game/store modules into the standalone ESM function `api/game.js`. Keep this generated file in Git; Vercel serves it at `/api/game`.
4. Open the production URL on two devices and play through all rounds. Share a join URL or four-character code.

The production handler intentionally refuses to run without shared Redis. Vercel functions are distributed/ephemeral, so an in-memory fallback would make rooms disappear or split between devices. The Redis Lua compare-and-set transaction protects simultaneous joins, votes, and score writes. Bundling the handler is important: Vercel's Node ESM function must not try to load uncompiled, extensionless TypeScript imports from `src/` at runtime.

## Tests

```bash
npm test
npx playwright install chromium              # one-time browser download
# Debian/Ubuntu may need this once if system libraries are missing:
sudo npx playwright install-deps chromium
npm run test:e2e
npm run build
```

The automated suite includes engine/store/content/accessibility unit and integration checks; a complete three-round authenticated HTTP match; and Chromium UI E2E with two isolated browser contexts (desktop host + mobile guest). The UI flow exercises invite-link joining, secure session restore after refresh, lobby readiness/settings, cross-device reactions, category selection, private bluff/wager/gambit actions, Truth Radar secrecy, private ballots, reveals, podium/persona, clipboard sharing, rematch, rulebook tabs, AI lobby controls, mobile overflow, and room exit. A production Vercel + Upstash integration still requires deployment credentials; local tests do not pretend to validate an external account.

## Project layout

- `src/lib/engine.ts` — rules, state machine, scoring and match awards.
- `src/lib/persona.ts` — match-stat-driven postgame Mirage Signature and share-card copy.
- `src/lib/store.ts` — session auth, public-state redaction, local store and atomic Upstash Redis CAS.
- `src/components/` — responsive game screens and UI pieces.
- `public/fonts/` — self-hosted Space Grotesk, Plus Jakarta Sans, and JetBrains Mono (with OFL licenses included).
- `src/server/gameHandler.ts` — source handler shared by the Vercel bundle.
- `scripts/bundle-vercel-api.mjs` — bundles local game/store modules into standalone `api/game.js` during build.
- `api/game.js` — committed, self-contained Vercel Node function bundle.
- `e2e/` and `playwright.config.ts` — real-browser multiplayer and responsive-flow checks.
- `vercel.json` — Vite single-page-app route fallback; `/api/game` is served by the Vercel function.
