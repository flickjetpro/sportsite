import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buffstreamsbackup.shop',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
