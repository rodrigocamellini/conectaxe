import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'ConectAxé',
            short_name: 'ConectAxé',
            description: 'Sistema de Gestão para Terreiros',
            theme_color: '#ffffff',
            icons: [
              {
                src: '/images/icon192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/images/icon512x512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            maximumFileSizeToCacheInBytes: 12000000,
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: true
          },
          devOptions: {
            enabled: true
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('firebase')) {
                  return 'firebase';
                }
                if (id.includes('lucide-react')) {
                  return 'icons';
                }
                if (id.includes('react-joyride')) {
                  return 'joyride';
                }
                if (id.includes('@google/genai')) {
                  return 'genai';
                }
                if (id.includes('date-fns')) {
                return 'date-fns';
              }
              return 'vendor';
              }
            }
          }
        }
      }
    };
});
