import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import Tailwind compiler

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // 2. Add it to the active plugins array
  ],
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
