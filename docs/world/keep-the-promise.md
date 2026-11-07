# Side quest 05 — 說好了要保密

## Authored routes

The complete user source is preserved at `docs/manuscripts/side-quest-05-secret-user.txt`. `src/content/quests/keep-the-promise.json` contains stable source-line IDs, explicit speakers, authored dialogue and three routes: Kentaro alone, Natsumi alone, and the separately authored duet. The duet is not a concatenation of the solo scripts. Generic player lines in the shared solo source resolve to the controlled character. The quoted duo quest notice is narration, not spoken dialogue.

Accept at the village square, then visit the central well. Morning/afternoon slots are available. Solo or invited/random companion status selects the route at activity start and remains fixed through save/load. Exploration and reading consume one activity slot in total, not one per location. The quest is optional and never enters the mainline gate.

## Short exploration, no timed minigame

Match the fantasy map's three symbols to the real scene: the dragon mountains are three boulders, the silver river is the irrigation channel, and the king's castle is the mill-side shed. Players may visit landmarks in different orders, inspect alternatives and request map hints. Incorrect observations do not fail, spend time or remove progress. The map is drawn with SVG to remain legible and interactive on phones. Observation points align with the generated landscape's fixed aspect ratio.

The encounter with Mira follows identifying the rocks and canal. Solo routes then play their distinct conversation with Tobi; the duet uses the supplied Mira encounter and separate couple interactions. After all three map symbols and the encounter are recorded, inspecting the relocated flowerpot reveals the blue box. Solo routes offer two restrained UI responses (accompany him, or give him a little time); neither promises Mira's answer or speaks on her behalf.

The reunion and each route's inn-night ending remain authored story. Completion grants exactly one blue marble, no invented cash, and a reconciled-children flag. The later departure timetable and new daily conversations are reserved for future authored content; no departure or adult storyline is invented here.

## Artwork and CG

The active CGs are the user's supplied files, copied without image editing:

- `public/assets/cg/cg-secret-tobi-reunion-user.png`
- `public/assets/cg/cg-secret-mira-reunion-user.png`

Their expected SHA-256 hashes are recorded in `docs/world/secret-cg-hashes.json`. The Tobi CG appears at his admission that he does not want Mira to leave. Mira's appears at her promise to finish drawing the sea after returning. Ordinary character overlays are suppressed during CGs. Desktop uses a restrained slow push; narrow screens preserve the supplied wide composition. Reduced-motion mode disables movement.

The active character cutouts are `public/assets/characters/tobi-village-neutral-v2.png` and `mira-village-neutral-v2.png`, derived from those CG references through built-in ImageGen. Alpha transparency is retained. Earlier generated character/CG drafts remain unreferenced; they are not the game's active art. See `secret-characters.md` for visual continuity and prompts.

The shared landscape is `public/assets/backgrounds/bg-estrala-secret-landmarks-day.png`. Its generation prompt requested a warm, no-people 16:9 anime village with three boulders and tree at left, irrigation channel and bridge centrally, mill-side pointed-roof shed and moved flowerpots at right, plus a tiny blue star-lid box. Natural cream stone, terracotta roofs, lush greenery, delicate painted lines; no text, UI or watermark. It was generated with the built-in image tool, not CLI.

## Menu shortcuts

Story system menu and village 選單 expose 支線捷徑 for all five implemented quests. No quest shortcut is added to the cover. The former cover inn shortcut moves into the menu; legacy inn-preview saves remain accessible there.

Every supported role/companion preview uses `yamada-nishi:quest-preview:<quest>:<route>`, separate from official story/world saves, ordinary world preview and legacy inn preview. The menu offers resume or a fresh replay. First-wages previews preserve its board-story entry; other quests enter their authored opening. Character-exclusive and duet-only constraints remain enforced. Replaying never pays rewards into the official world.

## Verification

Automated checks cover all four controlled-role/companion combinations, different exploration orders, wrong observations, interrupted/resumed encounters, once-only reward, user-CG hashes, v2 references and all menu preview combinations. Browser QA covers menu access, duet exploration, both supplied CGs in their actual dialogue positions, revised portrait display, full settlement and one marble in the independent preview inventory.
