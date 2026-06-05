# Glance

The start page you actually want to open. Glance is a fast, local-first home for every new tab: a clock and greeting, your focus for the day, quick-launch bookmarks, and weather with a daily quote, all arranged in a bento grid you can drag into whatever shape fits your day.

It works the moment you open it. No sign up, no account, no waiting. Everything lives in your browser.

## Features

- Local-first. Your layout, bookmarks, and focus are saved in IndexedDB and load instantly, even offline.
- A draggable, resizable bento grid (powered by react-grid-layout).
- A "Dark Neon Dev" theme out of the box, plus more themes you can switch between.
- Shareable themes. Export a theme as a short code, or paste someone else's to make their look yours.
- Keyless weather via Open-Meteo, plus a quote that rotates once a day.

## Tech

- Next.js (App Router) and TypeScript
- Tailwind CSS v4
- IndexedDB via idb
- react-grid-layout for the grid
- Vitest and Playwright for tests

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use Glance. The marketing page lives at /welcome.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint the codebase
- `npm run test` — run unit and component tests (Vitest)
- `npm run test:watch` — run tests in watch mode
- `npm run e2e` — run end-to-end tests (Playwright)

## License

MIT

## Cloud sync (optional)

Glance works fully offline with no account. To enable cross device sync and the public theme gallery, connect a Supabase project:

1. Create a project at supabase.com and enable the GitHub auth provider (register a GitHub OAuth app, set the callback to your Supabase auth callback URL).
2. Run the SQL in `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your project settings.
4. Restart the dev server. A "sign in with GitHub" button and a theme gallery will appear.

Without these variables the app simply stays local only.
