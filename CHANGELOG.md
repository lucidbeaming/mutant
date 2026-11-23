# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
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
