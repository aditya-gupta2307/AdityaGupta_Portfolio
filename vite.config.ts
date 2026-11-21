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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        undercut: resolve(__dirname, 'undercut/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three') || id.includes('three-stdlib') || id.includes('troika')) return 'r3f';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
