# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2](https://github.com/klh-app/use-theme/compare/v1.1.1...v1.1.2) (2026-04-23)


### Bug Fixes

* correct bundle size claims and document React 19 support ([#13](https://github.com/klh-app/use-theme/issues/13)) ([4ed373d](https://github.com/klh-app/use-theme/commit/4ed373d6c1c2c2b85bf240676f8d91ada3b4d60f))

## [1.1.1](https://github.com/klh-app/use-theme/compare/v1.1.0...v1.1.1) (2026-04-23)


### Bug Fixes

* bump engines.node to &gt;=20.19.0 to match Vite 8 requirement ([229cb22](https://github.com/klh-app/use-theme/commit/229cb22f29f7c11fc54bb1a14376c7da220c7f07))
* **ci:** use Node 20 LTS to match engines field and add lint step ([98e64af](https://github.com/klh-app/use-theme/commit/98e64affdbadb69fd556dc64dae89a110fdeb84e))

## [1.1.0](https://github.com/klh-app/use-theme/compare/v1.0.3...v1.1.0) (2026-04-13)


### Features

* add built-in cookie storage adapter ([#7](https://github.com/klh-app/use-theme/issues/7)) ([0e8ab53](https://github.com/klh-app/use-theme/commit/0e8ab53c7c9a8f67586e8c47d244a8f28873e398))

## [1.0.3](https://github.com/klh-app/use-theme/compare/v1.0.2...v1.0.3) (2026-04-09)


### Bug Fixes

* optimize logo and exclude assets from npm tarball ([a01c8d4](https://github.com/klh-app/use-theme/commit/a01c8d408ce5556fae0ec6ab750cc9312a9d5dc2))

## [1.0.2](https://github.com/klh-app/theme/compare/v1.0.1...v1.0.2) (2026-04-09)


### Bug Fixes

* add GitHub Packages dual publish and sync engine config ([a609de6](https://github.com/klh-app/theme/commit/a609de6c3823900f04cafe1751ab56f870f41b41))
* remove explicit pnpm version from ci.yml ([db5ad11](https://github.com/klh-app/theme/commit/db5ad11956f54d8608610e1322740559d7e03a12))
* remove explicit pnpm version to use packageManager field ([bd1e8cf](https://github.com/klh-app/theme/commit/bd1e8cf24162ce4a82bf69d7c532992e4b2b55a0))

## [1.0.1](https://github.com/klh-app/theme/compare/v1.0.0...v1.0.1) (2026-04-07)


### Bug Fixes

* sync node engine requirements ([#3](https://github.com/klh-app/theme/issues/3)) ([f7d0a25](https://github.com/klh-app/theme/commit/f7d0a25667da06cdbee71c1f431d0bdb728f4fdc))

## 1.0.0 (2026-04-07)


### ⚠ BREAKING CHANGES

* initial stable 1.0.0 release

### Features

* initial stable 1.0.0 release ([bf0d910](https://github.com/klh-app/theme/commit/bf0d91027435e7acb50f93757523706ffbb0e964))
* setup Changesets for automated versioning and npm releases ([e2710cd](https://github.com/klh-app/theme/commit/e2710cd61b4d4795900e64386750e761d4ad8ce3))
* switch to release-please for fully automated CI/CD and npm releases ([8c62079](https://github.com/klh-app/theme/commit/8c620797f5bab372c04b31c7dab39e3bb0e7fcce))
* **theme:** add 'use client' directive and post-build script for Next.js support ([3254b31](https://github.com/klh-app/theme/commit/3254b319c307e3b4f805c2db5857ef4000f7e497))
* **theme:** add color-scheme support for native UI elements ([cf1c56c](https://github.com/klh-app/theme/commit/cf1c56ce2b4c947c114a2669a794aa7ad2136b25))
* **theme:** add generic type support to useTheme hook for better autocomplete ([6f3cb4c](https://github.com/klh-app/theme/commit/6f3cb4c6c07caf237e0f35625b91352e07b5cf48))


### Bug Fixes

* address code review — 8 issues across architecture, correctness, and tests ([1c472e0](https://github.com/klh-app/theme/commit/1c472e0bacf8be70782b5e06624fe5d8a8474c69))
* prevent xss in fouc script via safe json stringify ([2468716](https://github.com/klh-app/theme/commit/2468716e55ef450b79de90ba7d1ae4a03088cc86))

## [0.1.1] - 2026-04-06

### Fixed

- Disable sourcemaps to keep the published package size minimal (~2 KB)

## [0.1.0] - 2026-04-06

### Added

- `ThemeProvider` component with configurable themes, storage, and attributes
- `useTheme()` hook — `useSyncExternalStore`-based theme access
- `useSystemTheme()` hook — standalone OS color scheme detection
- `getThemeScript()` / `<ThemeScript />` for FOUC prevention
- `createLocalStorageAdapter()` with cross-tab sync via `StorageEvent`
- Pluggable `ThemeStorage` interface for custom storage backends
- `disableTransitionOnChange` prop to suppress CSS transitions during theme switch
- Support for `class`, `data-*`, and multiple HTML attributes
- Theme name → attribute value mapping via `value` prop
- SSR-safe — all DOM access guarded
- TypeScript strict mode with full declaration files
- ESM + CJS dual publishing via tsup
