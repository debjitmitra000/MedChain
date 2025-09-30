import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true, // Listen on all addresses
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
        },
        '/health': {
          target: backend,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: mode === 'development',
    },
    resolve: {
      alias: {
        // Add any aliases here if needed
      },
    },
  };
});