# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.0] - 2026-11-23

First release: Electron 45, drag and drop working again (broken since Electron 32 removed `File.path`), speed and retiming, image-sequence mode and glitch effects, and a README with screenshots. There's no prebuilt app yet; build one with `npm run dist`.

### Added

- README: screenshots, requirements (Node 20.19+/22.12+), retiming / image-sequence / glitch features, recipe storage location, build output, How it works, related projects (#10)
- MIT license (#4)
- Package metadata: `repository`, `bugs` and `homepage` in `package.json` (#4)
- Ayu light theme, video glitch effects, speed control and image-sequence mode (#1)
- ESLint and Prettier setup with `lint`, `lint:fix`, `format` and `format:check` scripts (#2)

### Changed

- `.gitignore`: shared `.vscode/extensions.json`, Sublime workspaces, `.env.example`, `.eslintcache` (#6)
- Electron 33 → 45, electron-builder 26, electron-vite 6, Vite 8, @vitejs/plugin-react 6 (#2)
- better-sqlite3 11 → 13 (11.x no longer builds on Node 26), rebuilt for Electron 45 (#2)
- `electron.vite.config.ts` relies on electron-vite 6's default dependency externalizing (#2)
- Source formatted with Prettier (#2)

### Fixed

- Dropping files or folders adds them again: the drop zone read `File.path`, which Electron 32 removed, so every drop was ignored. Paths now come from `webUtils.getPathForFile()` via the preload API (#8)

### Security

- Resolved 1 critical and 25 high npm advisories (#2)

[Unreleased]: https://github.com/lucidbeaming/mutant/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lucidbeaming/mutant/releases/tag/v1.0.0
