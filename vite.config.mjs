import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs keep the app working when hosted below a domain subpath.
  base: './',
  plugins: [react()],
});
