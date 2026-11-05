/**
 * Endereço do Socket.IO. Fica separado de tempoReal.ts de propósito: a camada de mocks importa
 * estas constantes, e não pode carregar o socket.io-client antes de a MSW instalar a
 * interceptação de WebSocket (o engine.io-client guarda o construtor WebSocket ao ser carregado).
 */
export const URL_TEMPO_REAL: string = import.meta.env.VITE_SOCKET_URL ?? window.location.origin
/** Caminho próprio (em vez de /socket.io/) para não se confundir com o WebSocket do HMR do Vite. */
export const CAMINHO_TEMPO_REAL = '/tempo-real/'
