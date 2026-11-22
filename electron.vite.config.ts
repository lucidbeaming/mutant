import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

// electron-vite 6 externalizes dependencies for main and preload by default
// (build.externalizeDeps), so fluent-ffmpeg, gm and better-sqlite3 stay
// unbundled and load from node_modules at runtime.
export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
