// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // 1. IMPORTANTE: Activar el modo servidor para los correos
  output: 'server', 

  // 2. Configuración de Idiomas (i18n)
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false 
    }
  },

  // 3. Tus plugins actuales (Tailwind)
  vite: {
    plugins: [tailwindcss()]
  },

  // 4. El adaptador para que funcione en Vercel
  adapter: vercel()
});