import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/brownchickenbrowncow/',  // Must include this because of how the gh-page directories are organized for the environments (build artifact for this environment will reside in the subdirectory of the same name)
})
