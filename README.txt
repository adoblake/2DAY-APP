2DAY — BASE V9

OPEN THE BROWSER-ONLY VERSION
1. Open index.html in a modern browser.
2. Complete onboarding or continue the saved journey.
3. Use PROFILE to save phone/email and notification preferences.
4. Use VIEW PROGRESS to inspect the journey.

WHAT WORKS IMMEDIATELY
- Mobile-first Daily Meal experience
- First-run body-path onboarding
- Journey ID persists in browser storage until completion
- Contact information and notification preferences persist
- Browser notifications when permission is granted and the app is open/installed
- Real Test Text uses the delivery server when SMS is configured
- Optional automatic progress texts arrive 1 or 2 hours after each meal window
- Completed meals receive a celebratory follow-up; missed meals receive a low-pressure reset
- One-time post-setup calendar prompt creates Morning / Midday / Night recurring calendar events for the journey
- Test Email opens the email client with a generated weekly report
- One retroactive missed-timeframe completion per calendar day
- Journey, seven-day, and recent-day progress dashboards

REAL AUTOMATIC SMS + WEEKLY EMAIL
The package includes server.mjs. It can send real SMS with Twilio and real weekly email with Resend after provider credentials are supplied securely.

1. Copy .env.example to .env and add provider credentials through your host's environment-variable settings.
2. Run: npm start
3. Open the displayed localhost URL, or deploy the folder to a Node-compatible HTTPS host.
4. The profile screen will say when SMS and/or email delivery is connected.

The server schedules optional current-focus texts at 7:30 AM, 12:00 PM, and 5:30 PM in the user's saved timezone. Optional progress texts run 1 or 2 hours after each meal window, based on the user's setting, and adapt the message to whether that meal is marked complete. Weekly progress email is scheduled at 9:00 AM on the day selected by the user.

IMPORTANT
Opening index.html directly cannot autonomously send an SMS or email in the background. That is a browser security limitation, not a missing button. The included server is the secure delivery layer; provider accounts/credentials are still required because phone and email networks do not permit anonymous sending.

V7 update: Reduced the Current Focus meal title by another 6px across its responsive size range.


V9 update: Added automated after-meal progress texts with 1h/2h timing, opt-out controls, celebratory completion language, and the post-setup Add to Calendar flow.

2DAY BASE V10 — HOME + NAV + THEMES
- New Home dashboard: goal path, journey progress bar, follow-through, meals completed, days left, weekly pace.
- Current Focus preview on Home jumps directly back to today's active meal.
- Fixed two-button mobile navigation uses the supplied Home and Graph SVG artwork; inline icons inherit 2DAY brand color via currentColor.
- Light and Dark modes persist on-device and can be changed from Home or Profile.
- Original supplied SVG files are preserved in /assets as home-source.svg and day-source.svg.
