import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const enableVisualizer = mode === 'analyze';

  console.log('Vite mode:', mode); // Debug chế độ Vite

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(enableVisualizer
        ? [
            visualizer({
              filename: 'dist/bundle-stats.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            state: ['zustand'],
            ui: ['lucide-react'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('Proxying request:', req.url, 'to:', proxyReq.getHeader('host') + proxyReq.path);
            });
          },
        },
      },
    },
  };
});