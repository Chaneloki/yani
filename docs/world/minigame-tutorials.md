# Dynamic minigame tutorials

Each minigame offers an optional hands-on practice on its first play. Players may skip it and reopen it later with 新手教學. Preferences are stored separately from story and world saves in `yamada-nishi:dynamic-tutorials:v1` in localStorage. Clearing browser data resets these preferences.

## Independent tutorial IDs

- `inn-room`: room tidying
- `inn-lock`: door lock
- `inn-lamp`: lamp repair
- `cargo-pack`: cargo packing
- `cart-kentaro`, `cart-natsumi`: cart support, separately for each character
- `axle-repair`: axle fixing
- `skyrail-kentaro`, `skyrail-natsumi`: train rescue, separately for each character
- `work-timing`: timed work

Practice does not grant rewards, spend game time, or change quest progress. Real-time gameplay pauses while the offer or practice is open. Inn practice reuses the actual interaction views with isolated callbacks; other practices introduce the core controls in a forgiving practice board. The train game's full reference instructions remain available separately.

## Adding a minigame

Register a stable ID and an interactive practice factory in `src/ui/tutorial-practices.js`. Mount the controller from `src/ui/minigame-tutorial.js`, call `enter(id)` when actual play opens, and expose `show(id)` through a 新手教學 button. Use `onToggle` to pause gameplay and clear held input. Call `close()` when leaving the game to cancel pending prompts and dispose practice animations/listeners. Do not connect practice callbacks to real quest mutations.
