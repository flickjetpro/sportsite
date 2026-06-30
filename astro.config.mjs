import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://alphastreams.fit',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
