import { chaveDoItem, type Cotacao, type CupomCotacao, type ItemCotacao } from './contratos'
import { mesmoValor } from './eth'

/**
 * Regras do contexto Compra sobre Cotações. Só comparam respostas da API; nenhum valor
 * mostrado ao colecionador é calculado aqui (critério 1).
 */

function mesmoCupom(a: CupomCotacao | null, b: CupomCotacao | null): boolean {
  if (a === null || b === null) return a === b
  return a.codigo === b.codigo && a.valido === b.valido && mesmoValor(a.desconto, b.desconto)
}

function mesmoItem(a: ItemCotacao, b: ItemCotacao): boolean {
  return (
    a.quantidade === b.quantidade &&
    a.disponivel === b.disponivel &&
    mesmoValor(a.precoUnitario, b.precoUnitario)
  )
}

/**
 * "Bater com a aceita" (resposta 3 da sessão 3): itens (Preço e disponibilidade de cada um),
 * cupom, taxa e total, todos iguais. O id da Cotação não entra na comparação.
 */
export function cotacoesBatem(aceita: Cotacao, nova: Cotacao): boolean {
  if (aceita.itens.length !== nova.itens.length) return false
  const novosPorChave = new Map(nova.itens.map((item) => [chaveDoItem(item), item]))
  const itensBatem = aceita.itens.every((item) => {
    const novo = novosPorChave.get(chaveDoItem(item))
    return novo !== undefined && mesmoItem(item, novo)
  })
  return (
    itensBatem &&
    mesmoCupom(aceita.cupom, nova.cupom) &&
    mesmoValor(aceita.subtotal, nova.subtotal) &&
    mesmoValor(aceita.desconto, nova.desconto) &&
    mesmoValor(aceita.taxaRede, nova.taxaRede) &&
    mesmoValor(aceita.total, nova.total)
  )
}

export function temItemEsgotado(cotacao: Cotacao): boolean {
  return cotacao.itens.some((item) => !item.disponivel)
}

export interface AlteracaoDeItem {
  chave: string
  nome: string
  precoAntes: string
  precoDepois: string
  precoMudou: boolean
  esgotou: boolean
  voltouADisponivel: boolean
}

/** Lista o que mudou, item por item, entre a Cotação aceita e a nova (ambas da API). */
export function alteracoesDeItens(aceita: Cotacao, nova: Cotacao): AlteracaoDeItem[] {
  const novosPorChave = new Map(nova.itens.map((item) => [chaveDoItem(item), item]))
  const alteracoes: AlteracaoDeItem[] = []
  for (const antes of aceita.itens) {
    const depois = novosPorChave.get(chaveDoItem(antes))
    if (!depois || mesmoItem(antes, depois)) continue
    alteracoes.push({
      chave: chaveDoItem(antes),
      nome: antes.nome,
      precoAntes: antes.precoUnitario,
      precoDepois: depois.precoUnitario,
      precoMudou: !mesmoValor(antes.precoUnitario, depois.precoUnitario),
      esgotou: antes.disponivel && !depois.disponivel,
      voltouADisponivel: !antes.disponivel && depois.disponivel,
    })
  }
  return alteracoes
}
