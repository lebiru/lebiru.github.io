import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: '.',
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        name: 'JumpRush',
        entryFileNames: 'assets/jumprush-[hash].js',
        chunkFileNames: 'assets/jumprush-[hash].js',
        assetFileNames: 'assets/jumprush-[hash][extname]'
      }
    }
  }
});
