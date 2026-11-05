import { chaveDoItem, type Cotacao, type Eth, type ItemCotacao } from './contratos'
import { alteracoesDeItens, type AlteracaoDeItem } from './cotacao'
import { ethParaWei, formatarEth, mesmoValor } from './eth'
import { FalhaNaRevalidacao, useCompra } from './useCompra'

export function CarrinhoTela() {
  const compra = useCompra()
  const { aceita, novaCotacao } = compra

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Carrinho</h1>
        <IndicadorTempoReal conectado={compra.tempoRealConectado} />
      </header>

      {compra.carrinho.isError || (aceita === null && compra.cotacaoAtual.isError) ? (
        <ErroAoCarregar aoTentarDeNovo={() => (compra.carrinho.isError ? compra.carrinho.refetch() : compra.tentarBuscarCotacaoDeNovo())} />
      ) : aceita === null ? (
        <EsqueletoCarrinho />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="itens-titulo">
            <h2 id="itens-titulo" className="sr-only">
              Itens do Carrinho
            </h2>
            <AvisoDeAlteracao
              alteracoes={novaCotacao ? alteracoesDeItens(aceita, novaCotacao) : []}
              buscando={compra.buscandoNovaCotacao}
            />
            <ul aria-label="Itens do Carrinho" className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
              {aceita.itens.map((item) => {
                const novo = novaCotacao?.itens.find((i) => chaveDoItem(i) === chaveDoItem(item))
                const alteracao = novaCotacao
                  ? alteracoesDeItens(aceita, novaCotacao).find((a) => a.chave === chaveDoItem(item))
                  : undefined
                return <LinhaDoItem key={chaveDoItem(item)} item={item} novo={novo} alteracao={alteracao} />
              })}
            </ul>
          </section>

          <ResumoDaCotacao compra={compra} aceita={aceita} nova={novaCotacao} />
        </div>
      )}
    </main>
  )
}

function IndicadorTempoReal({ conectado }: { conectado: boolean }) {
  return (
    <p className="flex items-center gap-2 text-sm text-zinc-400" data-testid="tempo-real">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${conectado ? 'bg-emerald-400' : 'bg-zinc-500 motion-safe:animate-pulse'}`}
      />
      {conectado ? 'Alterações ao vivo: conectado' : 'Alterações ao vivo: conectando…'}
    </p>
  )
}

function AvisoDeAlteracao({ alteracoes, buscando }: { alteracoes: AlteracaoDeItem[]; buscando: boolean }) {
  const frases = alteracoes.map((a) => {
    if (a.esgotou) return `A edição de ${a.nome} esgotou.`
    if (a.voltouADisponivel) return `${a.nome} voltou a ficar disponível.`
    return `O Preço de ${a.nome} mudou de ${formatarEth(a.precoAntes)} para ${formatarEth(a.precoDepois)}.`
  })
  const texto = buscando ? 'Recebemos uma alteração no Carrinho. Buscando a nova Cotação…' : frases.join(' ')

  return (
    <div role="status" aria-live="polite" className="mb-4 min-h-0 empty:hidden">
      {texto && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{texto}</p>
      )}
    </div>
  )
}

function LinhaDoItem({ item, novo, alteracao }: { item: ItemCotacao; novo?: ItemCotacao; alteracao?: AlteracaoDeItem }) {
  const esgotado = novo ? !novo.disponivel : !item.disponivel
  const subiu = alteracao?.precoMudou && ethParaWei(alteracao.precoDepois) > ethParaWei(alteracao.precoAntes)

  return (
    <li aria-label={item.nome} className="flex flex-wrap items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-lg font-medium">{item.nome}</p>
        <p className="text-sm text-zinc-400">Quantidade: {item.quantidade}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {alteracao?.precoMudou && (
            <Selo tom="ambar">{subiu ? 'Preço subiu' : 'Preço caiu'}</Selo>
          )}
          {esgotado && <Selo tom="vermelho">Esgotado</Selo>}
        </div>
        {esgotado && (
          <p className="mt-2 text-sm text-red-200">Esta edição esgotou. Remova o item do Carrinho para continuar.</p>
        )}
      </div>
      <p className="font-mono text-base tabular-nums" data-testid="preco-item">
        {alteracao?.precoMudou
          ? `${formatarEth(alteracao.precoAntes)} → ${formatarEth(alteracao.precoDepois)}`
          : formatarEth(item.precoUnitario)}
      </p>
    </li>
  )
}

function Selo({ tom, children }: { tom: 'ambar' | 'vermelho'; children: string }) {
  const cores = tom === 'ambar' ? 'border-amber-400/50 text-amber-200' : 'border-red-400/60 text-red-200'
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${cores}`}>{children}</span>
}

function ResumoDaCotacao({
  compra,
  aceita,
  nova,
}: {
  compra: ReturnType<typeof useCompra>
  aceita: Cotacao
  nova: Cotacao | null
}) {
  const mostrada = nova ?? aceita
  const resultado = compra.confirmar.data
  const motivoBloqueio = compra.pedidoEnviado
    ? null
    : compra.haItemEsgotado
      ? 'Há item esgotado no Carrinho. Remova-o para continuar.'
      : compra.buscandoNovaCotacao
        ? 'Aguarde a nova Cotação.'
        : compra.falhaAoBuscarNovaCotacao
          ? 'Não foi possível buscar a nova Cotação.'
          : nova
            ? 'A Cotação mudou. Aceite a nova Cotação para confirmar o Pedido.'
            : null

  return (
    <section
      aria-labelledby="resumo-titulo"
      className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-8"
    >
      <h2 id="resumo-titulo" className="mb-4 text-lg font-semibold">
        {nova ? 'Nova Cotação, aguardando aceite' : 'Resumo da Cotação aceita'}
      </h2>

      <dl className="space-y-2 text-sm">
        <LinhaDoResumo rotulo="Subtotal" valor={mostrada.subtotal} antes={nova ? aceita.subtotal : undefined} testid="resumo-subtotal" />
        {mostrada.cupom && (
          <LinhaDoResumo
            rotulo={`Desconto (cupom ${mostrada.cupom.codigo})`}
            valor={mostrada.desconto}
            antes={nova ? aceita.desconto : undefined}
            testid="resumo-desconto"
          />
        )}
        <LinhaDoResumo rotulo="Taxa de rede" valor={mostrada.taxaRede} antes={nova ? aceita.taxaRede : undefined} testid="resumo-taxa" />
        <div className="my-3 border-t border-white/10" />
        <LinhaDoResumo rotulo="Total" valor={mostrada.total} antes={nova ? aceita.total : undefined} destaque testid="resumo-total" />
      </dl>

      {mostrada.cupom && !mostrada.cupom.valido && (
        <p className="mt-3 text-sm text-red-200">O cupom {mostrada.cupom.codigo} deixou de valer.</p>
      )}

      {compra.falhaAoBuscarNovaCotacao && (
        <div role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-100">
          <p>Recebemos uma alteração, mas não foi possível buscar a nova Cotação.</p>
          <button type="button" onClick={compra.tentarBuscarCotacaoDeNovo} className="mt-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Tentar de novo
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {nova && (
          <button
            type="button"
            onClick={compra.aceitarNovaCotacao}
            disabled={!compra.podeAceitar}
            className="w-full rounded-xl border border-violet-300/60 px-4 py-3 font-medium text-violet-100 hover:bg-violet-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aceitar nova Cotação
          </button>
        )}

        <button
          type="button"
          onClick={() => compra.confirmar.mutate()}
          disabled={!compra.podeConfirmar}
          aria-describedby={motivoBloqueio ? 'motivo-bloqueio' : undefined}
          className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {compra.confirmar.isPending ? 'Revalidando o total…' : 'Confirmar pedido'}
        </button>

        {motivoBloqueio && (
          <p id="motivo-bloqueio" className="text-sm text-zinc-300">
            {motivoBloqueio}
          </p>
        )}
      </div>

      <div className="mt-4" aria-live="polite">
        {compra.confirmar.error && (
          <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-100">
            {compra.confirmar.error instanceof FalhaNaRevalidacao
              ? 'Não foi possível revalidar o total. Nenhum Pedido foi enviado e seus itens continuam no Carrinho. Tente confirmar de novo.'
              : 'Não foi possível enviar o Pedido. Seus itens continuam no Carrinho. Tente de novo.'}
          </p>
        )}
        {resultado?.tipo === 'divergiu' && nova && (
          <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
            O total mudou desde a Cotação que você aceitou. Nenhum Pedido foi enviado: confira e aceite a nova Cotação.
          </p>
        )}
        {compra.pedidoEnviado && (
          <p role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            Pedido enviado com o total de {formatarEth(compra.pedidoEnviado.total)}. Ele está pendente.
          </p>
        )}
      </div>
    </section>
  )
}

function LinhaDoResumo({
  rotulo,
  valor,
  antes,
  destaque = false,
  testid,
}: {
  rotulo: string
  valor: Eth
  antes?: Eth
  destaque?: boolean
  testid: string
}) {
  const mudou = antes !== undefined && !mesmoValor(antes, valor)
  return (
    <div className={`flex items-baseline justify-between gap-4 ${destaque ? 'text-base font-semibold' : ''}`} data-testid={testid}>
      <dt className="text-zinc-300">{rotulo}</dt>
      <dd className="text-right font-mono tabular-nums">
        {formatarEth(valor)}
        {mudou && <span className="block text-xs font-normal text-zinc-400">antes {formatarEth(antes)}</span>}
      </dd>
    </div>
  )
}

function EsqueletoCarrinho() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="Carregando o Carrinho">
      <div className="space-y-px overflow-hidden rounded-2xl border border-white/10">
        {[0, 1].map((i) => (
          <div key={i} className="h-[6.5rem] bg-white/[0.05] motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-white/10 bg-white/[0.05] motion-safe:animate-pulse" />
    </div>
  )
}

function ErroAoCarregar({ aoTentarDeNovo }: { aoTentarDeNovo: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 p-6">
      <p>Não foi possível carregar o Carrinho e a Cotação.</p>
      <button type="button" onClick={aoTentarDeNovo} className="mt-3 underline underline-offset-4">
        Tentar de novo
      </button>
    </div>
  )
}
