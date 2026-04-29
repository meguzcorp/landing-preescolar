// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 1. Configuración de Idiomas (i18n)
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      // false: tu-sitio.com/ (español) y tu-sitio.com/en/ (inglés)
      // true: tu-sitio.com/es/ y tu-sitio.com/en/
      prefixDefaultLocale: false 
    }
  },

  // 2. Tus plugins actuales (Tailwind)
  vite: {
    plugins: [tailwindcss()]
  }
});