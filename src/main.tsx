import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
})

async function iniciar() {
  // A camada de mocks é ativada por configuração (VITE_MOCKS=false desliga).
  if (import.meta.env.VITE_MOCKS !== 'false') {
    const { iniciarMocks } = await import('./compra/mocks/browser')
    await iniciarMocks()
  }
  // Importado só depois dos mocks: o engine.io-client guarda o construtor WebSocket ao ser
  // carregado, e a MSW precisa já ter instalado a interceptação nesse momento.
  const { CarrinhoTela } = await import('./compra/CarrinhoTela')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CarrinhoTela />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void iniciar()
