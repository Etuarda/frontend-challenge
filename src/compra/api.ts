import axios from 'axios'
import type {
  Carrinho,
  Cotacao,
  CriarPedidoCorpo,
  Pedido,
  PedirCotacaoCorpo,
} from './contratos'

/** Sem resposta em 8 s conta como falha (critério 5: "falhar ou não responder"). */
export const http = axios.create({ baseURL: '/api', timeout: 8000 })

export async function buscarCarrinho(signal?: AbortSignal): Promise<Carrinho> {
  const { data } = await http.get<Carrinho>('/carrinho', { signal })
  return data
}

export async function pedirCotacao(carrinho: Carrinho, signal?: AbortSignal): Promise<Cotacao> {
  const corpo: PedirCotacaoCorpo = { itens: carrinho.itens, cupom: carrinho.cupom }
  const { data } = await http.post<Cotacao>('/cotacoes', corpo, { signal })
  return data
}

export async function criarPedido(corpo: CriarPedidoCorpo, chaveIdempotencia: string): Promise<Pedido> {
  const { data } = await http.post<Pedido>('/pedidos', corpo, {
    headers: { 'Idempotency-Key': chaveIdempotencia },
  })
  return data
}
