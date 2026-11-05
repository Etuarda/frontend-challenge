import { setupWorker } from 'msw/browser'
import { controleDosMocks } from './controle'
import { handlersRest, handlersTempoReal } from './handlers'

export async function iniciarMocks(): Promise<void> {
  const worker = setupWorker(...handlersRest, ...handlersTempoReal)
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  window.__mocks = controleDosMocks
}
