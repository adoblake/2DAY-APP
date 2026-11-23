# 2DAY

Meal-planning and daily follow-through PWA. Plain Node with no dependencies (Node 22+, CI uses 24).

## Run
- `npm start` (port 4173), or `npm run dev` to restart on changes

## Verify
- `npm test` (`node --test`, also runs in CI)
- UI changes: run `verify-ui`, including an offline reload.

## Ship
- The static app runs on GitHub Pages. The Node server is only for optional messaging and legacy calendar subscriptions.

## Gotchas
- Any change to shell files means bumping `CACHE` in `sw.js` (`2day-vX.Y.Z-…`). Otherwise users keep the old app.
  `update.html` is the recovery page for stuck caches.
- Delivery APIs have no auth or rate limits. Never expose credential-backed messaging publicly until they do.
- Never commit `.env`.
