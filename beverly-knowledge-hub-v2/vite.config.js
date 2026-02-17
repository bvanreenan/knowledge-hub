import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate cached chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
          ],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
