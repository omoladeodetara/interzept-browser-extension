import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        options: path.resolve(__dirname, 'src/options/index.html'),
        // popup: path.resolve(__dirname, 'src/popup/index.html'), // Using existing popup.html instead
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    target: 'es2017',
    minify: false, // Easier debugging in extension
    sourcemap: true, // Helpful for debugging
  },
});
