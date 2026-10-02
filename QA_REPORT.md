# Mirage Royale — QA Report

**Verification date:** 2 October 2026  
**Test target:** local Vite application and local game API  
**Result:** all automated checks passed after a clean dependency install.

## Test results

| Check | Result |
|---|---:|
| `npm ci` | Passed |
| `npm test` | 16/16 tests passed across 6 files |
| `npm run test:e2e` | 2/2 Playwright Chromium scenarios passed |
| `npm run build` | Passed |
| `npm audit` | 0 reported vulnerabilities |

## End-to-end coverage

- Full three-round match using two separate authenticated browser contexts: desktop host and mobile guest.
- Invite-link join, ready-to-launch gating, refresh/session restoration, room settings, and cross-client reaction sync.
- Category voting, bluff submission, wager selection, Double Agent and Aegis gambits, private Truth Radar, kudos, private verdicts, round scoring, sequential declassification, awards, final standings, copyable match results, and rematch.
- Mobile horizontal-overflow checks across lobby, category, bluff, suspect lineup, reveal, and final screens; no uncaught browser exceptions in the full-match scenario.
- Small-screen rulebook tabs, AI challenger add/remove, timer changes, accessible room/name input labels, and leave-room flow.
- HTTP integration independently verifies all three scoring rounds, truth/author/session-secret redaction, final winner/awards, and rematch reset.

## Product/UX changes from QA

- Added a match-stat-driven **Your Mirage Signature** archetype at the podium; copied results now include that persona and show visible clipboard success/failure feedback.
- Fixed narrow-phone header overflow by wrapping the room/round status into a centered second row.
- Associated the room-code and player-name labels with their fields, improving keyboard and assistive-technology access.

## Boundaries

This verifies the local Vite app, not a deployed production service. Vercel/Upstash credentials were not supplied, so shared Redis in a deployed project and an externally reachable production URL remain untested. The browser run uses isolated desktop/mobile contexts in one local Chromium process; it is not a physical-device, Safari/Firefox, broad network-failure, or load/stress test. The automated contrast test covers selected core palette pairs, not full WCAG conformance.
