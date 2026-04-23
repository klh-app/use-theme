# Contributing to @klh-app/use-theme

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.12.0
- [pnpm](https://pnpm.io/) 10.x (`corepack enable` to use the pinned version)

## Setup

```bash
git clone https://github.com/klh-app/use-theme.git
cd use-theme
pnpm install
```

## Development

```bash
pnpm dev          # Watch mode (rebuild on change)
pnpm test:watch   # Run tests in watch mode
pnpm typecheck    # Type-check without emitting
pnpm lint         # Lint with Biome
pnpm lint:fix     # Auto-fix lint issues
pnpm build        # Production build
```

## Testing

Tests use [Vitest](https://vitest.dev/) with jsdom. Run the full suite with coverage:

```bash
pnpm test:coverage
```

All PRs should maintain or improve test coverage.

## Pull Requests

1. Fork the repo and create a branch from `main`.
2. Make your changes — keep PRs focused on a single concern.
3. Ensure `pnpm lint`, `pnpm typecheck`, and `pnpm test` all pass.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages (e.g., `feat:`, `fix:`, `chore:`).
5. Open a PR against `main`.

## Releases

Releases are automated via [Release Please](https://github.com/googleapis/release-please). Conventional commit messages drive version bumps and changelog generation.
