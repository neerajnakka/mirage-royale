# Mirage Royale — Design & Engineering Notes

## Product thesis

Mirage Royale is a remote-first party game about two complementary skills: inventing a believable falsehood and reading a room full of friends. It is built around six short, clear, simultaneous stages rather than long turns, so every player is writing, choosing, voting, reacting, or watching a reveal. The aim is easy entry, social payoff, and just enough tactical depth to make a rematch feel different.

## Game design decisions

- **Simultaneous participation:** category voting, bluff writing, and truth selection avoid a long turn queue. Short, explicit phases also make it clear when the room is waiting for someone. This follows established party-game design advice to keep turns short and keep players engaged together rather than idle between turns ([Board Game Design Course](https://boardgamedesigncourse.com/whose-turn-is-it-anyway/)).
- **Two separate scoring routes:** truth hunters earn wager-based points; bluff writers earn a per-player bounty when someone falls for their lie. Players who are not trivia experts can still win through creativity and social reading.
- **Wagers have actual risk:** 1× is safe; a wrong locked 2× / 3× truth verdict loses 250 / 500 points. Correct truth payouts are 500 / 1,000 / 1,500, doubled in the final round. A one-use Aegis Shield absorbs the miss penalty and preserves a streak. This prevents “always pick the largest multiplier” from being the dominant no-cost strategy.
- **Counterplay is private:** a once-per-match Truth Radar crosses out one fake on that player’s screen. It does not expose the scan to the table or make a larger room an automatic 50/50.
- **A reveal is a social payoff:** the host progressively opens the dossiers, then the interface discloses the source, the fact, authorship, victims, and points. Match awards recognize different play styles, not just the highest total. A new post-match **Mirage Signature** converts the player’s actual bluff, truth, wager, kudos, and decoy stats into a playful archetype; the copyable match card includes that identity.
- **Small-room resilience:** a house decoy ensures at least four cards in a two-player lineup; AI challengers are optional for hosts testing alone.

## UX and interaction model

The interface applies Nielsen Norman Group heuristics for **visibility of system status**, **error prevention**, **recognition rather than recall**, and contextual help: vote counts, locked states, a timer, phase labels, inline validation, a persistent standings panel, and a rules drawer are visible when needed ([NN/G usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)). Each phase has one dominant action. The 4-letter room code and direct invite link remain easy to copy; ready state and connected-player roster are explicit. Browser E2E caught and fixed a narrow-screen top-bar overflow by moving room/round status onto a centered second row on phones. Room/name inputs now have programmatically associated labels for assistive technology.

## Visual system

- **Mood:** “Obsidian Velvet & Electric Aurora”—deep ink surfaces, moving cyan/violet/magenta light, and restrained gold for score and championship moments.
- **Typography:** self-hosted, locally bundled variable fonts—Space Grotesk for display, Plus Jakarta Sans for interface copy, and JetBrains Mono for codes, timers, and score values. The project includes the fonts’ Open Font License files; no external font request is needed at runtime.
- **Motion:** phase-tinted canvas aurora, low-amplitude floating particles, pointer-responsive tactile cards, sequential dossier reveals, and synthesized Web Audio cues. Reduced-motion preferences disable continuous canvas animation and confetti; sound can be muted.
- **Color/accessibility:** key body-copy and accent/button pairings are tested against WCAG AA’s 4.5:1 normal-text threshold; buttons use dark foregrounds on bright fuchsia/coral/gold surfaces. WCAG 2.2 is the reference standard for text contrast, focus, reflow, and reduced-motion considerations ([W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)). The automated check covers the core palette pairings, not every possible rendered state or a complete conformance audit.

## Trivia integrity

The starter bank contains 24 prompts across six categories (four per category). The answer and factoid are checked against a linked source; during the reveal, players can open that source. Several viral summaries were deliberately corrected: the UK fish rule is about suspected illegally obtained fish (not oddly holding salmon); the Swiss guinea-pig rule is described as a social-welfare requirement (not a guaranteed “rent-a-pet” business); the Eiffel Tower scam had one confirmed sale and a failed repeat attempt; Cloudflare’s lamps add entropy rather than act as the sole source of encryption keys; the dolphins-getting-high anecdote was replaced with platypus electroreception. Examples of primary or high-quality references include the [UK Salmon Act](https://www.legislation.gov.uk/ukpga/1986/62/section/32), [Nintendo’s official history](https://www.nintendo.co.jp/corporate/en/history/index.html), the [University of Queensland Pitch Drop Experiment](https://smp.uq.edu.au/pitch-drop-experiment), and [Cloudflare’s LavaRand technical note](https://blog.cloudflare.com/lavarand-in-production-the-nitty-gritty-technical-details/).

## Multiplayer architecture and deployment

- The frontend calls `/api/game` directly. `src/server/gameHandler.ts` is bundled with esbuild into the standalone ESM Vercel Node function at `api/game.js` before deployment. This avoids Node ESM trying to resolve uncompiled, extensionless TypeScript imports from `src/` at runtime.
- Vercel Functions may run on different instances. In-memory state is therefore allowed only in the local Vite preview; production refuses to silently use memory.
- Production rooms are stored in Upstash Redis through Vercel Marketplace credentials. A Redis Lua compare-and-set makes room mutations atomic so concurrent joins and ballots do not overwrite each other. Vercel documents that state shared across function instances should live in an external data store; Vercel KV is no longer offered for new projects and Redis integrations are provisioned through the Marketplace ([Vercel Redis docs](https://vercel.com/docs/redis)). Upstash documents atomic transactions and scripting for its REST API ([Upstash REST API](https://upstash.com/docs/redis/features/restapi)).
- Player session tokens are random per-device credentials; only a SHA-256 hash is stored server-side. Public room responses redact truth metadata, other players’ submitted answers, author identities, ballots, tactical choices, and session hashes until the appropriate reveal.
- The game uses short-interval polling for portable cross-device room updates. Vercel WebSockets are available in beta, but Vercel notes that connections can reconnect to another function instance and shared room state still needs external storage ([Vercel WebSockets](https://vercel.com/docs/functions/websockets)). Polling keeps this first version simple and resumable.

## Verification performed

- **18 unit/integration tests pass** across scoring and edge cases, authenticated room-store behavior, truth redaction, sourced trivia coverage, core contrast checks, persona selection, the standalone bundled Vercel handler (including its clear missing-storage JSON response), and a complete three-round/two-player HTTP match (final scores, awards, winner, and rematch reset).
- **2 Playwright Chromium E2E scenarios pass.** One drives two isolated browser contexts through a full three-round match (desktop host + mobile guest), including invite-link join, session restore after refresh, readiness, cross-device reactions, categories, bluffs, wagers, gambits, private Radar scan, kudos, ballots, sequential reveals, podium/persona, clipboard share, and rematch. It checks for browser exceptions and horizontal overflow across mobile gameplay stages. The second covers narrow-screen rulebook tabs, timer settings, AI add/remove, and leaving the room.
- `npm run build` passes; `npm audit` reports zero known vulnerabilities.
- This is real-browser **local Vite** testing—not an external-network, production Vercel/Upstash, or multi-browser/device-farm test. The deployed service still requires the owner’s Vercel project and Upstash integration; run a production smoke match on two actual devices after deployment.
