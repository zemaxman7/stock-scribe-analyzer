// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { viteSingleFile } from 'vite-plugin-singlefile'  // เพิ่มการนำเข้าปลั๊กอิน

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // เพิ่มปลั๊กอินที่จะรวม JavaScript/CSS เข้ากับ index.html (ปิดไว้เพื่อ PostgreSQL)
    // viteSingleFile(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['pg-native'],
  },
}))
