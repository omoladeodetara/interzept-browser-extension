import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Vite config for standalone React development (not extension build)
export default defineConfig({
  plugins: [react()],
  root: './src/options',
  build: {
    outDir: '../../dist-dev',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/styles': path.resolve(__dirname, './styles')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
