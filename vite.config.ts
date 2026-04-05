import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('scheduler')
            ) {
              return 'framework';
            }

            if (id.includes('lucide-react')) {
              return 'icons';
            }

            if (
              id.includes('jspdf') ||
              id.includes('pdf-lib') ||
              id.includes('react-cropper') ||
              id.includes('browser-image-compression')
            ) {
              return 'pdf-tools';
            }

            if (id.includes('canvas-confetti')) {
              return 'effects';
            }

            if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
              return 'observability';
            }
          }
        }
      }
    }
  };
});
