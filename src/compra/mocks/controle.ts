import type { Eth } from '../contratos'
import { chaveDoItem } from '../contratos'
import { proximoId, restaurarCenarioPadrao, servidor, type PedidoRecebido } from './db'
import { emitirNftAtualizado, quantidadeDeConexoesTempoReal } from './handlers'

/**
 * Controle dos cenários do servidor simulado, para demonstração e testes Playwright.
 * Muda o estado do "servidor" e emite o evento correspondente pelo Socket.IO simulado,
 * para REST e tempo real contarem a mesma história. Não toca em componentes nem no cache.
 */
export interface ControleDosMocks {
  /** Altera Preço e/ou disponibilidade de uma edição e emite `nft.updated`. */
  alterarEdicao(alteracao: { nftId: string; edicaoId: string; preco?: Eth; disponibilidade?: number }): void
  /** Faz POST /api/cotacoes responder 503 (ou volta ao normal). */
  falharCotacoes(falhar: boolean): void
  /** Faz um cupom deixar de valer. */
  invalidarCupom(codigo: string): void
  pedidosRecebidos(): PedidoRecebido[]
  conexoesTempoReal(): number
  restaurar(): void
}

declare global {
  interface Window {
    /** Disponível só com a camada de mocks ativa (src/compra/mocks/browser.ts). */
    __mocks?: ControleDosMocks
  }
}

export const controleDosMocks: ControleDosMocks = {
  alterarEdicao({ nftId, edicaoId, preco, disponibilidade }) {
    const edicao = servidor.edicoes.get(chaveDoItem({ nftId, edicaoId }))
    if (!edicao) throw new Error(`Edição inexistente: ${nftId}/${edicaoId}`)
    if (preco !== undefined) edicao.preco = preco
    if (disponibilidade !== undefined) edicao.disponibilidade = disponibilidade
    edicao.versao += 1
    emitirNftAtualizado({
      eventoId: proximoId('evt'),
      recurso: { tipo: 'nft', nftId, edicaoId },
      versao: edicao.versao,
      dados: { preco: edicao.preco, disponibilidade: edicao.disponibilidade },
    })
  },
  falharCotacoes(falhar) {
    servidor.cotacoesFalham = falhar
  },
  invalidarCupom(codigo) {
    const cupom = servidor.cupons.get(codigo)
    if (cupom) cupom.valido = false
  },
  pedidosRecebidos: () => structuredClone(servidor.pedidos),
  conexoesTempoReal: quantidadeDeConexoesTempoReal,
  restaurar: restaurarCenarioPadrao,
}
