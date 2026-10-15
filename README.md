# mosqai-authority-web

The dashboard for health authorities: *"What is happening across the monitored
area?"* It covers RBAC-scoped areas, a device map, device health, mosquito
activity and area analytics with **coverage** (low activity vs. no data /
offline), alerts and faults, AI evidence, and reports.

Privacy by default: users see device IDs and aggregated area data, not owner
identities, unless their role allows it.

Owner: `@MosqAI/core` team (RavynX0, Hope664).

## Technology

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Recharts · MapLibre GL · lucide icons

## Setup

```bash
pnpm install                 # also copies the MapLibre worker into public/maplibre/
cp .env.example .env.local
pnpm dev                     # http://localhost:3000
```

Screens (from the Figma desktop frames): Dashboard `/`, Surveillance Map `/map`
(`?device=MSQ-012` focuses a device), Reports, Alerts, Users, Devices,
Device details `/devices/[id]`, Settings.

**Data is seeded, not live.** The backend does not exist yet, so every page reads
through [`src/lib/api.ts`](src/lib/api.ts), which returns fixtures from
`src/lib/mock-data.ts`. Swapping those function bodies for fetches against
`NEXT_PUBLIC_API_URL` is the only change pages need. Actions that require the
backend (add/delete device or user, alert rules, maintenance) are disabled;
acknowledging alerts and generating reports only change local state.
Authentication (first M4 issue) is not implemented.

## Environment variables

`NEXT_PUBLIC_*` values are public. Server-only values stay unprefixed. See
[`.env.example`](.env.example).

## Development

Components follow the Figma design tokens. Charts must render "no data"
distinctly from zero.

## Testing

`pnpm lint`, `pnpm typecheck`, `pnpm test` (Vitest + Testing Library), `pnpm build`;
CI runs all four. Planned: Playwright for key flows (login, map, area report).

## Deployment

Docker image via `mosqai-infrastructure`.

## Contribution workflow

Branch from `develop` (`feature/…`, `fix/…`, `refactor/…`), use Conventional
Commits, open a PR into `develop`, one approval. Full rules:
[mosqai-docs/workflow.md](https://github.com/MosqAI/mosqai-docs/blob/develop/workflow.md).
