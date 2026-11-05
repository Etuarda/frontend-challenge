import type { Carrinho, Cotacao, CriarPedidoCorpo, Eth, PedirCotacaoCorpo } from '../contratos'
import { chaveDoItem } from '../contratos'
import { ethParaWei, weiParaEth } from '../eth'

/**
 * Estado do "servidor" simulado. Fica só em memória: cada página nova (e cada teste Playwright)
 * começa do cenário conhecido abaixo. REST e eventos leem e escrevem aqui.
 */

export interface EdicaoNoServidor {
  nftId: string
  edicaoId: string
  nome: string
  preco: Eth
  disponibilidade: number
  versao: number
}

export interface CupomNoServidor {
  desconto: Eth
  valido: boolean
}

export interface PedidoRecebido {
  id: string
  chaveIdempotencia: string
  corpo: CriarPedidoCorpo
}

export interface EstadoServidor {
  edicoes: Map<string, EdicaoNoServidor>
  carrinho: Carrinho
  cupons: Map<string, CupomNoServidor>
  taxaRede: Eth
  cotacoesFalham: boolean
  pedidos: PedidoRecebido[]
  sequencia: number
}

function cenarioPadrao(): EstadoServidor {
  const edicoes: EdicaoNoServidor[] = [
    { nftId: 'aurora-1', edicaoId: 'ed-1', nome: 'Aurora #1', preco: '0.45', disponibilidade: 3, versao: 1 },
    { nftId: 'mare-7', edicaoId: 'ed-1', nome: 'Maré #7', preco: '0.30', disponibilidade: 2, versao: 1 },
  ]
  return {
    edicoes: new Map(edicoes.map((e) => [chaveDoItem(e), e])),
    carrinho: {
      itens: [
        { nftId: 'aurora-1', edicaoId: 'ed-1', quantidade: 1 },
        { nftId: 'mare-7', edicaoId: 'ed-1', quantidade: 1 },
      ],
      cupom: null,
    },
    cupons: new Map([['COLECIONA5', { desconto: '0.05', valido: true }]]),
    taxaRede: '0.002',
    cotacoesFalham: false,
    pedidos: [],
    sequencia: 0,
  }
}

export let servidor: EstadoServidor = cenarioPadrao()

export function restaurarCenarioPadrao(): void {
  servidor = cenarioPadrao()
}

export function proximoId(prefixo: string): string {
  servidor.sequencia += 1
  return `${prefixo}-${servidor.sequencia}`
}

/** O "backend" calcula a Cotação. Itens esgotados não entram no subtotal. */
export function calcularCotacao(pedido: PedirCotacaoCorpo): Cotacao | { erro: string } {
  let subtotal = 0n
  const itens: Cotacao['itens'] = []
  for (const item of pedido.itens) {
    const edicao = servidor.edicoes.get(chaveDoItem(item))
    if (!edicao) return { erro: `Edição inexistente: ${chaveDoItem(item)}` }
    const disponivel = edicao.disponibilidade >= item.quantidade
    if (disponivel) subtotal += ethParaWei(edicao.preco) * BigInt(item.quantidade)
    itens.push({
      nftId: item.nftId,
      edicaoId: item.edicaoId,
      nome: edicao.nome,
      quantidade: item.quantidade,
      precoUnitario: edicao.preco,
      disponivel,
    })
  }

  let desconto = 0n
  let cupom: Cotacao['cupom'] = null
  if (pedido.cupom) {
    const doServidor = servidor.cupons.get(pedido.cupom)
    const valido = doServidor?.valido ?? false
    const valor = valido && doServidor ? ethParaWei(doServidor.desconto) : 0n
    desconto = valor > subtotal ? subtotal : valor
    cupom = { codigo: pedido.cupom, valido, desconto: weiParaEth(desconto) }
  }

  const taxa = ethParaWei(servidor.taxaRede)
  return {
    id: proximoId('cot'),
    itens,
    cupom,
    subtotal: weiParaEth(subtotal),
    desconto: weiParaEth(desconto),
    taxaRede: weiParaEth(taxa),
    total: weiParaEth(subtotal - desconto + taxa),
  }
}
