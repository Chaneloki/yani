# Side quest 03 — 曬在窗邊的草藥

Source: `docs/manuscripts/side-quest-03-herbs-user.txt`. All story paragraphs are preserved verbatim in `src/content/quests/windowsill-herbs.json`, with stable IDs, scene headings and explicit speakers. Runtime pagination uses the shared short-page rules.

After the existing introductory delivery, select Natsumi, accept at the village square, and visit Ayme's house. This optional one-time story is available in every time slot. Natsumi visits alone; Kentaro returns in the authored night scene. One activity slot is used for the complete story, including its night epilogue, following the existing activity abstraction; the story's afternoon/night lighting does not change availability. There is no minigame or title-screen shortcut. No cash reward has been invented.

The existing VN side-story reader provides portraits for supplied protagonists, typewriter text, local segment history, pause/resume and section skipping. Ayme uses a generated transparent portrait only on his dialogue. Generated cottage exterior and rainy tea-room backgrounds follow the authored move indoors; a rain overlay begins at the first raindrops. The scene returns to the sunlit exterior when the rain stops. The night scene retains the existing inn-room background.

Completion records two unverified notes (mirror gate rumor; old map at the mountain waystation), their hearsay source, and Ayme familiarity. These do not enter the mandatory mainline information gate. Read them under 情報筆記. The relationship flag is ready for later authored return-visit conversations; those conversations are not invented here.

## Generated artwork

Built-in ImageGen was used (no CLI/API fallback). Assets are saved in `public/assets/backgrounds/bg-estrala-herbalist-cottage-day.png`, `public/assets/backgrounds/bg-estrala-herbalist-interior-rain.png`, and `public/assets/characters/ayme-herbalist-neutral.png`. The portrait retains its generated alpha channel. No existing artwork was overwritten.

Prompt set:

1. Exterior: illustration-story; finished Japanese anime VN background, wide 16:9. Small elderly herbalist cottage in peaceful European fantasy Estrala: cream plaster and pale stone, timber beams, terracotta tiles, open wooden doorway, stone steps, window, drying herb bundles casting shadows, wooden rack with shallow woven bamboo trays and blue/red tied herb bundles. Afternoon light, trees and distant mountains, detailed painted anime art, muted greens and warm stone. Cottage and rack in upper two thirds, simple paving below for dialogue. No people, text, UI or watermark.
2. Interior: illustration-story; finished wide 16:9 Japanese anime VN background. Herbalist cottage with pale stone, timber, herb-jar shelves and drying bundles, bamboo trays brought inside. Window-side wooden tea table, exactly two ceramic cups, teapot, two chairs, worn open thick notebook with unreadable handwriting and a thinner old notebook. Gentle afternoon rain outside, diffuse cool daylight, warmth from small stove. Seated eye-level, table slightly left, simple lower quarter for dialogue. Natural sage and honey wood, detailed clean painted anime style. No people, legible text, UI or watermark.
3. Ayme: illustration-story; transparent VN portrait. Original elderly male herbalist with receding short silver-grey hair, thin round spectacles, observant warm eyes, lined face, restrained kindly smile and short grey beard. Linen shirt, muted sage-grey vest, brown apron, rolled sleeves. Calm practical capable person, not an ornate wizard. Delicate anime linework and soft cel shading, three-quarter standing view waist to hips, full head in frame, relaxed arm holding a thin worn notebook. Actual alpha background; no white backdrop, drawn checkerboard, text, frame, watermark or other characters.

## Verification

Automated coverage checks manuscript order, speaker presence, character/board restrictions, every time slot, persistence, one-time settlement and optional mainline status. Browser verification covers acceptance, all four section transitions, night scene, settlement and the two notebook entries, using the separate inn-preview save.
