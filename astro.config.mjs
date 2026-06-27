import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://buffstreamsbackup.xyz',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
