import { io, type Socket } from 'socket.io-client'
import { EVENTO_NFT_ATUALIZADO, type NftAtualizadoEvento } from './contratos'
import { CAMINHO_TEMPO_REAL, URL_TEMPO_REAL } from './enderecoTempoReal'

/**
 * Conexão Socket.IO das alterações de Preço/disponibilidade. Só WebSocket: é o transporte que
 * a simulação com MSW (@mswjs/socket.io-binding) intercepta; long-polling não é simulado.
 */

export interface OuvintesTempoReal {
  aoAtualizarNft: (evento: NftAtualizadoEvento) => void
  aoMudarConexao: (conectado: boolean) => void
}

/** Abre a conexão e devolve a função que libera listeners e desconecta. */
export function conectarTempoReal({ aoAtualizarNft, aoMudarConexao }: OuvintesTempoReal): () => void {
  const socket: Socket = io(URL_TEMPO_REAL, { path: CAMINHO_TEMPO_REAL, transports: ['websocket'] })
  const aoConectar = () => aoMudarConexao(true)
  const aoDesconectar = () => aoMudarConexao(false)

  socket.on('connect', aoConectar)
  socket.on('disconnect', aoDesconectar)
  socket.on(EVENTO_NFT_ATUALIZADO, aoAtualizarNft)

  return () => {
    socket.off('connect', aoConectar)
    socket.off('disconnect', aoDesconectar)
    socket.off(EVENTO_NFT_ATUALIZADO, aoAtualizarNft)
    socket.disconnect()
  }
}
