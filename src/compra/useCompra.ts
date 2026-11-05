import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buscarCarrinho, criarPedido, pedirCotacao } from './api'
import { chaveDoItem, type Carrinho, type Cotacao, type Pedido } from './contratos'
import { cotacoesBatem, temItemEsgotado } from './cotacao'
import { conectarTempoReal } from './tempoReal'

export const chavesCompra = {
  carrinho: ['carrinho'] as const,
  cotacaoRaiz: ['cotacao'] as const,
  cotacao: (carrinho: Carrinho | undefined) => ['cotacao', carrinho] as const,
}

/** A revalidação na confirmação falhou ou não respondeu (critério 5). */
export class FalhaNaRevalidacao extends Error {
  constructor(causa: unknown) {
    super('Não foi possível revalidar o total', { cause: causa })
    this.name = 'FalhaNaRevalidacao'
  }
}

export type ResultadoConfirmacao =
  | { tipo: 'enviado'; pedido: Pedido }
  | { tipo: 'divergiu' }

export function useCompra() {
  const queryClient = useQueryClient()

  const carrinho = useQuery({
    queryKey: chavesCompra.carrinho,
    queryFn: ({ signal }) => buscarCarrinho(signal),
  })

  /** Última Cotação recebida da API para este Carrinho. */
  const cotacaoAtual = useQuery({
    queryKey: chavesCompra.cotacao(carrinho.data),
    queryFn: ({ signal }) => pedirCotacao(carrinho.data!, signal),
    enabled: carrinho.data !== undefined,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  /** A Cotação que o colecionador aceitou. A primeira recebida ao abrir o Carrinho é a aceita. */
  const [aceita, setAceita] = useState<Cotacao | null>(null)
  useEffect(() => {
    if (aceita === null && cotacaoAtual.data) setAceita(cotacaoAtual.data)
  }, [aceita, cotacaoAtual.data])

  /** Critério 2 / resposta 1: alteração de um item do Carrinho → pedir Cotação nova à API. */
  const [tempoRealConectado, setTempoRealConectado] = useState(false)
  useEffect(() => {
    if (!carrinho.data) return
    const itensDoCarrinho = new Set(carrinho.data.itens.map(chaveDoItem))
    return conectarTempoReal({
      aoAtualizarNft: (evento) => {
        if (!itensDoCarrinho.has(chaveDoItem(evento.recurso))) return
        void queryClient.invalidateQueries({ queryKey: chavesCompra.cotacaoRaiz })
      },
      aoMudarConexao: setTempoRealConectado,
    })
  }, [carrinho.data, queryClient])

  const atual = cotacaoAtual.data
  const novaCotacao = aceita && atual && !cotacoesBatem(aceita, atual) ? atual : null
  const buscandoNovaCotacao = aceita !== null && cotacaoAtual.isFetching
  const falhaAoBuscarNovaCotacao = aceita !== null && cotacaoAtual.isError
  /** Critério 3: enquanto isto for verdade, a confirmação fica bloqueada. */
  const aceitaDesatualizada = novaCotacao !== null || buscandoNovaCotacao || falhaAoBuscarNovaCotacao
  /** Resposta 4: com item esgotado não há aceite nem confirmação. */
  const haItemEsgotado = (novaCotacao ?? aceita) !== null && temItemEsgotado((novaCotacao ?? aceita)!)

  const chaveIdempotencia = useMemo(() => crypto.randomUUID(), [aceita?.id])

  const confirmar = useMutation({
    mutationFn: async (): Promise<ResultadoConfirmacao> => {
      if (!aceita || !carrinho.data || aceitaDesatualizada || haItemEsgotado) {
        throw new Error('Confirmação bloqueada: a Cotação aceita não está válida')
      }
      // Na confirmação, sempre uma Cotação nova à API (decisão da ADR-0001).
      let revalidada: Cotacao
      try {
        revalidada = await pedirCotacao(carrinho.data)
      } catch (erro) {
        throw new FalhaNaRevalidacao(erro)
      }
      if (!cotacoesBatem(aceita, revalidada) || temItemEsgotado(revalidada)) {
        // Não bateu: nada é enviado; a Cotação nova passa a aguardar aceite.
        queryClient.setQueryData(chavesCompra.cotacao(carrinho.data), revalidada)
        return { tipo: 'divergiu' }
      }
      // Critério 1: o Pedido leva a Cotação aceita.
      const pedido = await criarPedido(
        {
          cotacaoId: aceita.id,
          itens: carrinho.data.itens,
          cupom: carrinho.data.cupom,
          total: aceita.total,
        },
        chaveIdempotencia,
      )
      return { tipo: 'enviado', pedido }
    },
  })

  const pedidoEnviado = confirmar.data?.tipo === 'enviado' ? confirmar.data.pedido : null

  const podeAceitar = novaCotacao !== null && !buscandoNovaCotacao && !temItemEsgotado(novaCotacao)
  const podeConfirmar =
    aceita !== null && !aceitaDesatualizada && !haItemEsgotado && !confirmar.isPending && !pedidoEnviado

  return {
    carrinho,
    cotacaoAtual,
    aceita,
    novaCotacao,
    buscandoNovaCotacao,
    falhaAoBuscarNovaCotacao,
    aceitaDesatualizada,
    haItemEsgotado,
    tempoRealConectado,
    podeAceitar,
    podeConfirmar,
    pedidoEnviado,
    confirmar,
    aceitarNovaCotacao: () => {
      if (!podeAceitar || !novaCotacao) return
      setAceita(novaCotacao)
      confirmar.reset()
    },
    tentarBuscarCotacaoDeNovo: () => void cotacaoAtual.refetch(),
  }
}
