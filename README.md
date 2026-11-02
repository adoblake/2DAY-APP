# 2DAY

Meal planning and daily follow-through, imported from the supplied 2DAY Base V10 archive.

## Run locally

Requires Node.js 22 or newer (Node 24 is used in GitHub Actions). There are no external package dependencies.

```sh
npm start
```

The default port is 4173. `npm run dev` restarts the server after file changes. `npm test` runs the server integration check, including API persistence and private-file protection.

## Included experience

- Home with goals, journey progress, follow-through, weekly pace, and a Current Focus shortcut.
- Home/Day navigation with the supplied SVG artwork and persistent light/dark appearance.
- Opt-in calendar export containing three daily recurring meal windows. Users must import the downloaded calendar file.
- Separate current-focus and progress SMS preferences, with progress follow-ups 1 or 2 hours after meal windows.
- Weekly email scheduling and browser-local journey storage.

This update preserves the V10 visual design and fixes stale offline caching, private-file serving, environment-file loading, and notification sent-state handling.

## Optional messaging

Copy `.env.example` to `.env` and configure provider values locally or through your hosting platform's secure environment settings. `npm start` loads `.env` when present. Never commit credentials.

Twilio requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Resend requires `RESEND_API_KEY` and a verified `EMAIL_FROM` sender. Without them, the app remains usable, and `/api/status` reports messaging disconnected. Actual provider delivery has not been validated with this import.

Scheduled delivery requires the Node server to stay running. The browser syncs progress and preferences to the server; changes made offline must sync before the scheduler can use them. Browser notifications require permission and an active app. Calendar export does not require a messaging provider.

## Storage and hosting

The server stores profiles and progress in `.plate-data.json` by default. Set `DATA_FILE` to an absolute file path on a persistent volume for hosting. Browser data remains in local storage; back up both stores before clearing them. Credentials and server data are excluded from Git and from public file serving.

This is a development baseline: the delivery APIs have no account authentication or abuse protection. Add authentication, authorization, rate limits, and consent enforcement before exposing credential-backed messaging to the public. Use HTTPS and a persistent Node hosting service for background scheduling; static GitHub Pages cannot run the server.

## GitHub workflow

The repository's `App checks` workflow runs `npm test` on pushes and pull requests. Commit source changes and push them to GitHub; deployment is a separate step requiring a chosen host. The original archive's notes are retained in `README.txt` for reference; this README describes the current setup.
