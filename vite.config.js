import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/wedding-site/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        rsvp: resolve(import.meta.dirname, 'rsvp.html'),
      },
    },
  },
})
