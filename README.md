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
- Free calendar buttons for Google and Outlook: review and save editable meal/fitness events without downloads or account integration.
- Separate current-focus and progress SMS preferences, with progress follow-ups 1 or 2 hours after meal windows.
- Weekly email scheduling and browser-local journey storage.

This update preserves the V10 visual design and fixes stale offline caching, private-file serving, environment-file loading, and notification sent-state handling.

## Optional messaging

Copy `.env.example` to `.env` and configure provider values locally or through your hosting platform's secure environment settings. `npm start` loads `.env` when present. Never commit credentials.

Twilio requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Resend requires `RESEND_API_KEY` and a verified `EMAIL_FROM` sender. Without them, the app remains usable, and `/api/status` reports messaging disconnected. Actual provider delivery has not been validated with this import.

Scheduled delivery requires the Node server to stay running. The browser syncs progress and preferences to the server; changes made offline must sync before the scheduler can use them. Browser notifications require permission and an active app. Calendar buttons work on static hosting without a messaging provider.

## Storage and hosting

The server stores profiles and progress in `.plate-data.json` by default. Set `DATA_FILE` to an absolute file path on a persistent volume for hosting. Browser data remains in local storage; back up both stores before clearing them. Credentials and server data are excluded from Git and from public file serving.

This is a development baseline: the delivery APIs have no account authentication or abuse protection. Add authentication, authorization, rate limits, and consent enforcement before exposing credential-backed messaging to the public. Use HTTPS and a persistent Node hosting service for background scheduling; static GitHub Pages cannot run the server.

## GitHub workflow

The repository's `App checks` workflow runs `npm test` on pushes and pull requests. Commit source changes and push them to GitHub; deployment is a separate step requiring a chosen host. The original archive's notes are retained in `README.txt` for reference; this README describes the current setup.

## Sharing and revising your plan (10.2)

Home → **Share / QR** opens on-device QR generation, native sharing, link copying, and SVG download. Profile also provides sharing. The public HTTPS app address is used when hosted; local development requires entering the actual deployed address. The code strips query strings and fragments so profile and progress information are not included. QR creation does not deploy or verify a site: test the destination before distributing it. The QR generator is vendored from `qrcode-generator@1.4.4` (MIT), so no QR service receives the address.

Home → **Revise my plan** lets adults select Maintenance, Weight loss, or Muscle gain. Cancel discards the draft. Saving preserves the journey ID and completed meals, updates the meal guidance, and adjusts the journey end relative to its original start. Calendar events already saved must be edited in the outside calendar; Add links create new events. Legacy Fit profiles receive maintenance guidance and can revise that choice.

The Home program card distinguishes balanced food routines, activity, and recovery for each goal. It links USDA/CDC guidance and does not estimate calorie requirements, diagnose weight status from appearance, or promise results by a deadline. This is general wellness support, not a medically tailored program.

## Free outside-calendar buttons (12.0)

This is the active calendar flow. It runs on GitHub Pages, requires no server, credentials, paid host, download, or OAuth app. The post-setup prompt and Home/Day/Profile controls open **Add to my calendar**. Choose Google, personal Outlook, or work/school Outlook, review each event, select its destination calendar there, then save it.

Google links prefill daily meal recurrence and selected weekly fitness days through the journey end. Review the recurrence and timezone before saving. Outlook's composer links prefill the first event; the user sets Repeat and the end date in Outlook. Do not claim automatic Outlook recurrence from a URL. There is one event button per meal and an optional fitness button; the app does not bulk-add without approval. Sessions that have passed move to the next eligible date within the journey. An ended journey shows an explanation instead of invalid links.

Fitness days, start time, duration, and provider preferences are saved on this device. Saving those choices does not add anything externally. Clicking an Add link opens the provider editor and is not proof that the user saved the event. Later plan revisions do not update saved events: edit the existing events in the outside calendar to avoid duplicates. No read or write access to the user's calendar is requested by 2DAY.

Apple Calendar can display a Google or Microsoft account enabled on the device. Direct iCloud-only event adding is not supported. The old subscription endpoints remain on the optional Node server solely for older consumers, but the active UI does not call them or offer them as editable calendar integration.

Use the GitHub Pages URL for access and QR sharing. The optional Node server is still needed only for provider-backed messaging and legacy subscriptions. The proposed paid-host deployment and OAuth connection implementation have been removed from this free calendar workflow.
