# mosqai-authority-web

The dashboard for health authorities: *"What is happening across the monitored
area?"* It covers RBAC-scoped areas, a device map, device health, mosquito
activity and area analytics with **coverage** (low activity vs. no data /
offline), alerts and faults, AI evidence, and reports.

Privacy by default: users see device IDs and aggregated area data, not owner
identities, unless their role allows it.

Primary owner: Developer 1.

## Technology

Next.js · React · TypeScript · ECharts or Recharts · MapLibre GL

## Setup

> Not scaffolded yet. First M4 issue: "Authority authentication".

Planned: `pnpm install`, copy `.env.example` → `.env.local`, `pnpm dev`.

## Environment variables

`NEXT_PUBLIC_*` values are public. Server-only values stay unprefixed. See
[`.env.example`](.env.example).

## Development

Components follow the Figma design tokens. Charts must render "no data"
distinctly from zero.

## Testing

Vitest or Jest + Testing Library. Playwright for key flows (login, map, area report).

## Deployment

Docker image via `mosqai-infrastructure`.

## Contribution workflow

Branch from `develop` (`feature/…`, `fix/…`, `refactor/…`), use Conventional
Commits, open a PR into `develop`, one approval. Full rules:
[mosqai-docs/workflow.md](https://github.com/MosqAI/mosqai-docs/blob/develop/workflow.md).
