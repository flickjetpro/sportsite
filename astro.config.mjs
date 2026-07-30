import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buffstreams.buzz',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
