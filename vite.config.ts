import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pré-empacota tudo na subida do servidor: a tela e os mocks são importados dinamicamente,
  // e sem isso o Vite descobre as dependências tarde e recarrega a página no meio do teste.
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react/jsx-dev-runtime',
      '@tanstack/react-query',
      'axios',
      'socket.io-client',
      'msw',
      'msw/browser',
      '@mswjs/socket.io-binding',
    ],
  },
})
