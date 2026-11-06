# Busy Inn Night — playable first version

## Entry and story

- Main world: complete First Wages, accept Busy Inn Night **only at the square board**, visit the inn in the evening, then begin.
- Start screen: **旅舍 · 獨立試玩** offers Kentaro solo, Natsumi solo, or either controlled character with companion. These use the separate `yamada-nishi:inn-preview` storage key. They do not overwrite canonical story saves or the existing map preview. The chooser can resume the last unfinished inn preview.
- Variant freezes when beginning: companion together → together story; otherwise controlled character's solo story. Reloading preserves the variant.
- All supplied intro/ending paragraphs are preserved in `src/content/quests/busy-inn-night.json`. Original full request: `docs/manuscripts/side-quest-02-busy-inn-user.txt`.
- One first-story completion covers all variants. Afterward, separate repeatable **旅舍值班** (`sort`, old stable task ID retained) unlocks and never replays the first story.

## Controls and loop

- Click/tap a room, workstation or request bubble to walk there automatically. Manual keyboard/directional movement and free-floor movement are removed. A dotted route and arrival status show the destination. Characters stop at door approaches; room work opens separately. Walls, rooms and counters are excluded from pathfinding; old blocked positions migrate safely.
- Desk: ask guests, view room records, obtain consent to relocate the existing guest, register arrivals. Room 04 cannot be given away.
- Prepare room 02, let Dorn confirm the resident's voluntary move, then assign the two-bed room 01 to mother and child.
- Room preparation: drag bedding, chair and cup to their positions. Select-then-place works with touch/keyboard too.
- Kitchen provides hot water and bread; storage provides towels; reception holds the merchant's luggage. Carry up to two items, deliver in person or return unwanted items to source.
- The stuck door is a rotation interaction. Kentaro has a wider alignment tolerance; both characters can repair. Natsumi sees extra booking-record hints; both characters can ask/assign every guest.
- With a companion: they physically walk to pick up/deliver a service. Toggle autonomy or explicitly delegate a pending service. The duo has one extra service request, not double pay.
- Arrivals, AI and patience continue during room/lock interactions. A notification lets the player decide whether to finish or return to reception. Hidden tab, window blur and explicit pause stop the shift.
- Basic work always pays; waiting lowers only a small efficiency bonus. No eviction, countdown loss or forced restart.

## Data and extension

- `src/world/inn-game.js`: pure serializable state, pathfinding, service/booking rules, AI.
- `src/world/inn-ui.js`, `inn.css`: scene, controls, room and lock interactions, author story pages.
- World checkpoint every five active seconds, plus meaningful actions and explicit pause. Settlement uses the existing world receipt guard and advances one world time slot only once.
- First completion stores route/shared-experience and family/merchant encounter markers for future reappearance. No future-map scenes were invented.
- Repeat shifts vary arrival timing, one ordinary guest's service and the stuck room from the saved seed. Each shift has one door-lock incident plus difficulty-dependent bedside-lamp repairs. Lamp work uses brightness alignment and a continuous hold to stabilize current; AI cannot finish these manual repairs.
- Money values are prototype balance: first work 24, repeat work 18, efficiency bonus 0–4. Shared wallet rewards are paid once; duo is not two payouts.

## RPG walking art

Built-in image_gen generated two transparent 3×4 walk sheets using the existing hero/witch portraits as costume references:

- `public/assets/characters/rpg/kentaro-hero-walk.png`
- `public/assets/characters/rpg/natsumi-witch-walk.png`

Rows: front, back, left, right. Columns: step, idle, alternate step. Runtime uses nearest-neighbour rendering and a stepped animation, returning to idle when stopped. Exact prompts: `docs/world/inn-sprite-prompts.json`. The earlier single standing draft was not wired into the project. No additional generated background was needed; the prototype floor plan is rendered in CSS.

## First-play clarity and timed requests

- Optional six-step hands-on tutorial: ask both guests, prepare room 02, confirm consensual relocation, register the family, collect water, deliver it. Tutorial pauses guest waiting/arrivals and companion automation; skip at any point. Progress persists.
- No global work checklist. Arrivals and service requests produce one current call card and persistent bubbles at the corresponding room/reception. New calls can arrive while earlier ones remain unresolved; the card rotates among pending calls every 12 active seconds.
- Additional services appear 14 seconds apart after check-in. Carrying supplies in advance is allowed, but service and AI delegation require an active request. Missing a call does not discard it; its room bubble remains until handled.

## Shared VN and visible guest speech

Both implemented side stories use `src/world/quest-reader.js`: scene background, bottom gradient dialogue panel, explicit speaker, portraits only for speakers with supplied art, typewriter reveal, click to reveal/advance, backlog, pause and segment skip. Inn story speaker metadata is separate from the unchanged prose arrays. Solo endings switch to the existing inn-room night background on returning upstairs.

Guest inquiry opens a named dialogue modal and pauses the shift while reading. Timed service calls show a named speaker and quoted request. `inn-map.css` refines the floor-plan layers and matches navigation to visible door/station approaches.

## Difficulty presets

Choose before the shift starts; the selected configuration is serialized and cannot be rerolled mid-shift. Legacy in-progress saves retain the easy designation and their existing requests.

| Level | Solo services / lamp repairs | Duet services / lamp repairs | Solo wait allowance |
|---|---|---|---|
| Easy | 5 / 0 | 10 / 2 | 180 seconds |
| Standard | 8 / 1 | 12 / 3 | 125 seconds |
| Hard | 11 / 2 | 13 / 4 | 90 seconds |

All presets retain the one door repair. At the same level, duet arrivals are 20% earlier and their wait allowance is 20 seconds shorter. More manual lamp jobs keep the extra workload on the player as well as the AI. Waiting affects only the efficiency bonus, never basic wages. First-play teaching still suspends demands until the player finishes/skips it. Repeated shifts retain bounded seed-based arrival variation.

## Booking softlock fix (2026-11-06)

Skipping the guide exposed an invalid allocation: the traveler could take room 02 before the existing guest relocated, permanently blocking the family from room 01. Room 02 is now reserved for relocation; the traveler uses room 03, family room 01, and reserved merchant room 04. Reception explains preparation/consent requirements and links to the needed room instead of offering impossible choices. Unready confirmation is disabled. Legacy traveler-in-02 registrations are reopened on load while preserving cleaning, delivered services, time, seed, difficulty and other shift work.

Regression coverage includes all six difficulty/party configurations with traveler and merchant registered before the family, plus legacy booking recovery. No tutorial completion is required for these paths.
