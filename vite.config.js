import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(__dirname, './src/i18n/**'),
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
});
