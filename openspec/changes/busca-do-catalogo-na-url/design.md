# Design

## Context

Ver `proposal.md` (Why) e `specs/busca-do-catalogo/spec.md` (requisitos). Estado atual que
molda a abordagem:

- `src/main.tsx` renderiza `CarrinhoTela` direto, sem roteador. `@tanstack/react-query`, `axios` e
  `msw` já estão instalados; `@tanstack/react-router` não.
- Os mocks sobem por `iniciarMocks()` em `src/compra/mocks/browser.ts`, que cria o worker
  internamente (`setupWorker(...handlersRest, ...handlersTempoReal)`) sem expô-lo. Não dá para
  acrescentar handlers do Catálogo a esse worker sem editar `src/compra/`.
- `e2e/revalidar-cotacao.spec.ts` abre `/` e espera o Carrinho.
- Arquivos que esta change pode tocar (combinado com a aluna): `src/catalogo/**`, `src/main.tsx`,
  `e2e/busca-do-catalogo.spec.ts` e, como consequência da decisão 1, `package.json` e
  `package-lock.json`.
- Não há runner de teste unitário; a verificação é `npm run typecheck` e Playwright com MSW.

## Goals / Non-Goals

**Goals:**
- A URL é a única fonte da Busca do catálogo: nenhum `useState` guarda categoria, ordem, página
  ou busca confirmada.
- A lista exibida é sempre a resposta da API para os parâmetros da URL atual.

**Non-Goals:**
- Mover a tela Início para `/` (ver decisão 2).
- Estados de vazio, erro e skeleton (Q7); Preço em tempo real no catálogo.
- Unificar o "servidor" simulado do Catálogo com o da Compra.

## Decisions

### 1. TanStack Router com `validateSearch` na rota do Catálogo

O README exige: "Use TanStack Router nas rotas, parâmetros de busca e proteção dos fluxos
privados" (§4) e lista TanStack Router como roteamento obrigatório (§2). Então os parâmetros de
busca são lidos com `Route.useSearch()` e escritos com `navigate({ search })`, e a validação
fica em `validateSearch` da rota.

- `validateSearch` recebe o objeto bruto e devolve `BuscaDoCatalogo` já normalizada: valor fora do
  aceito vira padrão (premissa Q6). É uma função pura em `src/catalogo/buscaDoCatalogo.ts`, sem
  biblioteca de schema (zod etc. não está instalado e não é necessário para 5 campos).
- Escrita: `navigate({ search: (anterior) => ... })` com `push` (padrão do router) para toda ação
  do colecionador → uma entrada de histórico por ação (cenário 3). Funções puras de transição
  (`comBusca`, `comCategoria`, `comDisponivel`, `comOrdem`, `comPagina`) aplicam a regra "tudo que
  não é página volta para `pagina=1`" num lugar só.
- Correção de URL inválida ou de página além da última: `navigate({ search, replace: true })`,
  sem entrada no histórico.
- Formato da URL: o router recebe `parseSearch`/`stringifySearch` simples (cada valor como texto,
  sem JSON) para a URL ficar `?busca=lua&categoria=arte&disponivel=1&ordem=menor-preco&pagina=2`
  (premissa Q2). O serializador padrão do TanStack Router faria `disponivel=true` e poria aspas em
  textos que parecem número. Padrões (busca vazia, sem categoria, sem `disponivel`, ordem
  `mais-recentes`) são omitidos; `pagina` sempre sai (premissa Q3).

**Alternativa descartada:** `URLSearchParams` + `history.pushState` + `popstate` à mão. Funcionaria
sem dependência nova, mas contraria o README §2/§4 e deixaria o app sem o roteador de que
Detalhes do NFT, Login e rotas protegidas vão precisar.

**Consequência:** `@tanstack/react-router` entra em `dependencies` do `package.json`. Sem plugin de
rotas por arquivo: árvore de rotas em código (`createRootRoute`/`createRoute`), para não mexer em
`vite.config.ts`.

### 2. Rotas: Carrinho fica em `/`, Catálogo em `/catalogo`

`e2e/revalidar-cotacao.spec.ts` abre `/` e espera o Carrinho, e não pode ser editado nesta
change. Então a árvore em `src/main.tsx` fica: rota raiz → `/` (`CarrinhoTela`, importado sem
alteração) e `/catalogo` (tela Início). `src/catalogo/rota.tsx` exporta uma função que recebe a
rota pai e devolve a rota do Catálogo, para `main.tsx` só montar a árvore.

**Alternativa descartada:** Início em `/` e Carrinho em `/carrinho` — é o destino certo pelo
README, mas obriga a editar o teste da Compra. Fica para uma change que possa tocá-lo.

### 3. Estado remoto com TanStack Query, chave = Busca do catálogo normalizada

`useQuery({ queryKey: ['catalogo', 'nfts', busca], queryFn: ({ signal }) => listarNfts(busca, signal) })`.
Como a chave é a busca inteira, voltar no histórico reaproveita o cache daquela busca e uma
resposta atrasada de outra busca nunca aparece na tela atual (o `signal` cancela a requisição
abandonada). `placeholderData: keepPreviousData` evita a lista sumir entre páginas. Sem estados de
vazio/erro desenhados (Q7): a tela mostra só um texto mínimo nesses casos.

### 4. Contrato e cliente HTTP próprios do Catálogo

`src/catalogo/contratos.ts`:

- `GET /api/nfts?busca&categoria&disponivel&ordem&pagina&porPagina=12`
- Resposta `ListagemNfts { itens: NftResumo[]; pagina; porPagina; total; totalPaginas }`
- `NftResumo { id; nome; categoria: 'arte' | 'musica'; precoAtual: Eth; edicoesDisponiveis: number }`,
  com `precoAtual` = menor Preço atual entre as Edições (premissa Q8) e `Eth` como string decimal,
  como já faz a Compra.

`src/catalogo/api.ts` cria a própria instância Axios (`baseURL: '/api'`). Não importa de
`src/compra/` para manter os contextos separados (glossário).

A tela usa `totalPaginas` da resposta para corrigir `pagina` além da última (decisão 1, `replace`).

### 5. Mocks do Catálogo em `src/catalogo/mocks/`, registrados em `src/main.tsx`

- `src/catalogo/mocks/db.ts`: fixtures determinísticas — 30 NFTs de "Arte" (pelo menos 13 com
  "lua"/"Lua"/"Luá"/"Luar" no nome, para existir página 2 no cenário 1; alguns sem Edição
  disponível, para o cenário 2; um com várias Edições de Preços diferentes, para Q8) e 14 de
  "Música". Cada NFT tem `criadoEm` fixo para "mais recentes". Empates de Preço desempatam por
  `id`, para a ordem ser estável entre refreshes.
- `src/catalogo/mocks/handlers.ts`: `http.get('/api/nfts')` aplica busca (sem acento/maiúscula,
  `normalize('NFD')`), filtros, ordem e fatia de 12, nessa ordem.
- `src/main.tsx` deixa de chamar `iniciarMocks()` de `src/compra/mocks/browser.ts` e cria o
  worker com `[...handlersRest, ...handlersTempoReal, ...handlersCatalogo]`, mantendo
  `window.__mocks = controleDosMocks`. Um service worker só aceita um `setupWorker`, e o da Compra
  não expõe o worker.

**Alternativa descartada:** acrescentar um parâmetro de handlers extras a `iniciarMocks()` — mais
limpo, mas edita `src/compra/`.

### 6. Tela e acessibilidade mínima

`src/catalogo/InicioTela.tsx` com: `<form role="search">` (campo + botão "Buscar"); grupo de rádio
"Categoria" ("Todas", "Arte", "Música"); checkbox "só edições disponíveis"; `<select>` "Ordenar
por"; lista `aria-label="NFTs do catálogo"`; paginação com botões de número de página e
`aria-current="page"`. Os controles são controlados pela URL: o valor vem de `useSearch()`, o
`onChange` chama `navigate`. O campo de texto tem estado local só enquanto se digita, ressincronizado
com `busca` da URL quando ela muda (voltar/avançar). Tailwind, sem shadcn/ui nesta change.

## Risks / Trade-offs

- [`src/compra/mocks/browser.ts` fica sem uso] → Registrar no `tasks.md`; uma change que possa
  tocar `src/compra/` passa a composição dos workers para um módulo comum.
- [Início em `/catalogo`, não em `/`] → Decisão 2; o teste E2E do Catálogo usa `/catalogo`, então
  mudar a rota depois é trocar uma constante no teste.
- [Fixtures do Catálogo separadas das da Compra (`aurora-1`, `mare-7`)] → O README §6 pede estado
  consistente entre catálogo e carrinho; fica para a change de Detalhes/Carrinho a partir do
  catálogo. Nenhum cenário desta change cruza os dois.
- [Serializador de URL customizado diverge do padrão do TanStack Router] → Fica num só lugar
  (`src/catalogo/buscaDoCatalogo.ts`, exportado para o `createRouter`) e só lida com valores de
  texto; rotas futuras com parâmetros estruturados precisarão revisá-lo.
- [StrictMode monta efeitos duas vezes; a correção com `replace` poderia rodar duas vezes] → A
  correção é idempotente: só navega se a busca normalizada difere da URL atual.

## Migration Plan

Sem migração de dados. Rollback: reverter a change (remove a dependência e volta `main.tsx` a
renderizar só `CarrinhoTela`).
