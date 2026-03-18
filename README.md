# Mutant

Desktop app for batch processing media files using locally installed **ffmpeg** and **ImageMagick**.

Drag and drop files or folders, configure one or more output recipes (format, resize, color space, naming), and process everything in one go.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [ffmpeg](https://ffmpeg.org/) installed and available on PATH
- [ImageMagick](https://imagemagick.org/) v7+ installed and available on PATH (`magick` command)

## Setup

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run dist
```

## Features

### Input
- Drag-and-drop files or entire folders
- Recursive scanning of directories for media files
- Supports common image formats (JPEG, PNG, WebP, AVIF, TIFF, BMP, GIF) and video formats (MP4, MOV, AVI, MKV, WebM, M4V, MXF)

### Output Configuration
- Multiple independent output configs per batch — a single input file can produce N outputs
- **Image formats:** JPEG, PNG, WebP, AVIF, TIFF
- **Video formats:** H.264 Web (MP4), ProRes (Proxy/LT/422/422HQ/4444), VP9 (WebM), H.264 (MOV)
- **Resize:** width/height bounds, fit-within or cover mode, zoom slider (100%–400%)
- **Color space:** sRGB, Adobe RGB, Display P3 (images) / BT.709, BT.2020 (video)
- **Filename options:** prepend/append text, optional timestamp, optional incremental numbering, configurable positioning
- Each output targets its own directory

### Recipes
- Save and load named output configurations
- Auto-saves a "Last Session" recipe that restores on next launch
- SQLite-backed persistence

### Processing
- Sequential queue with per-operation progress reporting
- Cancellation support
- Filename collision handling (appends `_1`, `_2`, etc.)
- Error reporting per failed operation

## Tech Stack

- **Electron** + **React** + **TypeScript**
- **electron-vite** for build tooling
- **fluent-ffmpeg** for video processing
- **gm** (GraphicsMagick/ImageMagick wrapper) for image processing
- **better-sqlite3** for recipe storage
