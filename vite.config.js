import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: {
    watch: { ignored: ['**/logo-beco.png'] },
    proxy: {
      '/publico': 'http://127.0.0.1:3000',
      '/ingressos': 'http://127.0.0.1:3000'
    }
  }
});
