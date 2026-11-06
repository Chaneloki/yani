# First Wages: layout and companion feedback

- Compact gameplay headers and collapsible operation hints; story presentation remains separate.
- Desktop: stock beside crates. Mobile: crates before a compact six-item stock row.
- Packing controls remain sticky while scrolling. Cargo test feedback stays beside the board.
- Cart, rope and axle boards use viewport-aware sizing and smaller decorative road art.
- `src/world/companion-reactions.js` holds role-specific situational lines. The key is the player-controlled character; the speaker is their companion.
- Events include cargo pressure / imbalance / success, wheel lock / retry / completion, rope set completion / retry / ready, and cart bumps / slipping / recovery.
- Cart reactions change only when an event occurs, with a 3.2-second interval for routine warnings. Retry and milestone reactions have priority. Repeated retries alternate wording.
- No packing-to-transport difficulty coupling was added. Mechanics and reward rules remain unchanged.
