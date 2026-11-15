import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';

// Exact installed pdf.js version: the reader loads the matching worker from jsDelivr (src/lib/pdf.ts).
const pdfjsVersion = (JSON.parse(readFileSync(new URL('./node_modules/pdfjs-dist/package.json', import.meta.url), 'utf8')) as {
  version: string;
}).version;

export default defineConfig({
  plugins: [preact()],
  define: { __PDFJS_VERSION__: JSON.stringify(pdfjsVersion) },
  server: { open: '/app.html' },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'app.html',
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app-[name].js',
        assetFileNames: 'app.[ext]',
        inlineDynamicImports: true,
      },
    },
  },
});
