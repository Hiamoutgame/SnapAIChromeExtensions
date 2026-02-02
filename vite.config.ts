import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load .env
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  return {
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GEMINI_MODEL': JSON.stringify(geminiModel)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(process.cwd(), 'src/popup.ts'),
          background: resolve(process.cwd(), 'src/background.ts')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      },
      sourcemap: true,
      target: 'esnext',
      minify: false
    },
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src')
      }
    }
  };
});
