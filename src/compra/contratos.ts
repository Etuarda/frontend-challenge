/**
 * Contratos tipados entre transporte (REST e Socket.IO), estado e interface do contexto Compra.
 * Valores em ETH trafegam sempre como string decimal (ex.: "0.45"), nunca como number.
 */

/** Valor em ETH como string decimal, com até 18 casas. */
export type Eth = string

export interface ItemCarrinho {
  nftId: string
  edicaoId: string
  quantidade: number
}

/** GET /api/carrinho */
export interface Carrinho {
  itens: ItemCarrinho[]
  cupom: string | null
}

export interface ItemCotacao {
  nftId: string
  edicaoId: string
  nome: string
  quantidade: number
  precoUnitario: Eth
  disponivel: boolean
}

export interface CupomCotacao {
  codigo: string
  valido: boolean
  desconto: Eth
}

/** POST /api/cotacoes → resposta. É a referência para finalizar o Pedido. */
export interface Cotacao {
  id: string
  itens: ItemCotacao[]
  cupom: CupomCotacao | null
  subtotal: Eth
  desconto: Eth
  taxaRede: Eth
  total: Eth
}

/** POST /api/cotacoes → corpo */
export interface PedirCotacaoCorpo {
  itens: ItemCarrinho[]
  cupom: string | null
}

/** POST /api/pedidos → corpo (cabeçalho Idempotency-Key obrigatório) */
export interface CriarPedidoCorpo {
  cotacaoId: string
  itens: ItemCarrinho[]
  cupom: string | null
  total: Eth
}

/** POST /api/pedidos → resposta */
export interface Pedido {
  id: string
  status: 'pendente' | 'confirmado' | 'recusado'
  cotacaoId: string
  total: Eth
}

/** Corpo de erro das respostas REST */
export interface ErroApi {
  codigo: string
  mensagem: string
}

/** Evento Socket.IO emitido quando Preço ou disponibilidade de uma edição muda. */
export const EVENTO_NFT_ATUALIZADO = 'nft.updated'

export interface NftAtualizadoEvento {
  eventoId: string
  recurso: { tipo: 'nft'; nftId: string; edicaoId: string }
  versao: number
  dados: { preco: Eth; disponibilidade: number }
}

export function chaveDoItem(item: { nftId: string; edicaoId: string }): string {
  return `${item.nftId}/${item.edicaoId}`
}
