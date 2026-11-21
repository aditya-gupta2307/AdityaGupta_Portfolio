import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from https://aditya-gupta2307.github.io/AdityaGupta_Portfolio/
// so every asset URL needs the repository name as its base path.
export default defineConfig({
  base: '/AdityaGupta_Portfolio/',
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom', 'three'] },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'three', '@react-three/fiber', '@react-three/drei', 'gsap', 'gsap/ScrollTrigger'],
  },
  build: {
    target: 'es2022',
    // Explicit CSS targets: with the default, the minifier kept only
    // -webkit-backdrop-filter and dropped the standard property Chrome needs.
    cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4'],
    // The Three.js chunk is large by nature but is only loaded after the page
    // content has rendered.
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        undercut: resolve(__dirname, 'undercut/index.html'),
      },
      output: {
        // React renders the page text, so it ships up front; Three.js and
        // React Three Fiber are only reached through the lazily loaded scene.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/node_modules\/(three|three-stdlib|@react-three|its-fine|zustand|suspend-react|react-use-measure)\//.test(id)) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
