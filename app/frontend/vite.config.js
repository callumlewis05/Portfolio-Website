import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../../static/dist',
    emptyOutDir: true,
    target: 'esnext',

    rollupOptions: {
      input: 'src/main.js',

      output: {
        entryFileNames: 'main.js',        // ✅ name of main bundle
        chunkFileNames: 'chunks/[name].js', // optional: where dynamic chunks go
        assetFileNames: 'assets/[name].[ext]', // optional: where assets go
      }
    }
  }
});
