# Side quest 04 — 木匠的工作台

## Content and route

The source is preserved at `docs/manuscripts/side-quest-04-carpenter-user.txt`. Its story lines are imported verbatim with stable IDs and explicit speakers in `src/content/quests/carpenter-workbench.json`. Runtime uses the shared short-page pagination and VN side-story reader. The game begins after Karl offers to teach Kentaro, before the authored repaired-rack paragraph. The bakery and inn-night scenes remain intact. No title shortcut is added.

Control Kentaro, accept at the village square in the afternoon, then visit Karl's workshop. The story uses one activity slot, including its night epilogue. Natsumi does not accompany the workshop visit. This is optional and does not enter the mainline gate.

## Original game with a skill-dependent variation

`Woodwork` is a stage adapter around the existing `SkyrailRescue('kentaro')`. The dial, green zone, left/right inputs, Space/touch hold and release-to-finish behavior are retained. Easy/standard/hard vary tolerance, disturbance strength/frequency and progress rate. Later sections slightly strengthen disturbances. The original point-and-click latch mode is also available.

The added variation is **intermittent left/right reversal**, within the same original game. There is no anchor selection, new puzzle, or separate acceptance stage. A warning lasts 1.15 seconds before inputs reverse for a randomized 3.2–4.6 seconds; then a one-second restoration notice precedes another normal interval. The first normal interval lasts 2.2–3 seconds, later intervals 4.5–7 seconds. Stage simulation time controls these timers, so tutorial/pause states do not consume the interval.

A dedicated visual mapping strip always shows physical keys at the top and actual movement at the bottom. During reversal the paths cross, left physical input maps to right movement, right to left, and both on-screen key arrows change to their actual movement. A contrasting border and short ⇄ notice accompany the change; restoration shows uncrossed arrows and a green notice. Warnings do not reverse early. Space/holding remains unchanged. Sounds supplement rather than replace the visual cues. Reduced-motion mode retains all mapping information without animation.

結構判讀 optionally forecasts a reversal 1.2 seconds before the universal warning begins; it does not cancel the reversal or hide the essential cues from players who have not activated it. No direction swapping is added to earlier train/delivery scenes in this stage.

A short system line states that Kentaro learned 結構判讀 from Karl before the challenge; there is no added teaching story. Learning is saved immediately, including when leaving the unfinished quest. Completing the full authored story separately unlocks repeat work and Karl familiarity. The visible skill control now focuses on forecasting the direction reversal. Existing passive support state is retained for save compatibility.

The first-play tutorial remains optional and uses an isolated copy of the actual controls with the skill available for practice. It has no effect on quest progress. Live play and keyboard inputs pause while tutorial overlays are open.

## Repeat work and persistence

`workshop-repair` is received at the same square, requires completed `carpenter-workbench`, is Kentaro-only, and is available morning/afternoon once daily. It opens the same gameplay without replaying the personal story. Its current adjustable balancing default is 18 coins, 2 XP. The one-time story grants 3 XP and the named skill; no cash reward is invented for it.

Story phase/page, game progress, random seed, direction mode/countdown/cycle count, skill toggles and learned skills persist with the world state. Settlement checks actual gameplay success and story completion. The skill is displayed in the village skills panel. Future waystation devices can consult `skills.kentaro.includes('structural-reading')`; those devices and follow-up NPC stories remain unimplemented rather than invented.

## Generated artwork

Built-in ImageGen was used; no CLI fallback. New assets:

- `public/assets/backgrounds/bg-estrala-carpenter-workshop-day.png`
- `public/assets/backgrounds/bg-estrala-bakery-day.png`
- `public/assets/characters/karl-carpenter-neutral.png` (generated alpha retained)

Prompt set:

1. Workshop: illustration-story, finished wide 16:9 Japanese anime VN background. Young carpenter's modest workshop in a cream-stone and terracotta-roof European fantasy village; warm afternoon sunlight through half-open timber windows. Central wooden workbench, half-assembled folding market display rack with hinged legs, braces and joints, shavings, saw/plane tools, timber by the door, unfinished shelves/cart parts. Practical craft, detailed painterly anime linework, muted honey wood and sage. Lower quarter simple floor for dialogue. No people, text, watermark or UI.
2. Karl: illustration-story, original young adult male carpenter, transparent waist-to-hips VN portrait. Short chestnut-brown untidy hair, thoughtful tired friendly eyes, restrained smile, rolled-sleeve linen shirt, moss-grey apron, pencil and wood shavings, capable hands holding folded work order. Quiet practical craftsman, distinct from blond hero. Delicate anime linework and soft cel shading, three-quarter pose, full head/shoulders inside frame. True alpha, no white rectangle, checkerboard, text, UI or watermark.
3. Bakery: illustration-story, finished wide 16:9 Japanese anime VN background. Warm afternoon bakery storefront, cream stone and timber, terracotta tiles, open door, window with rustic rolls, fabric awning, bread basket, two-person outdoor bench on stone paving, twig by earth patch, distant village houses and greenery. Delicate painterly anime art, natural sage and honey wood. Simple lower paving for dialogue overlay. No people, legible signage, text, UI or watermark.

## Checks

Automated tests cover all three difficulty levels, normal/reversed input mapping, warning and restoration transitions, exact deterministic restoration, manuscript order/speakers, character/board restrictions, early skill acquisition, once-only settlement and repeat-work gating. Browser checks cover acceptance, original controls, release-to-complete, authored aftermath/bakery/night, skill persistence and repeat-work UI.
