# Tasks

Arquivos permitidos: `src/catalogo/**`, `src/main.tsx`, `e2e/busca-do-catalogo.spec.ts`,
`package.json`, `package-lock.json`. Nenhum arquivo de `src/compra/` muda (conferir com
`git status src/compra` ao fim de cada grupo).

## 1. Roteador

- [ ] 1.1 Instalar `@tanstack/react-router` (`npm install @tanstack/react-router`) e verificar que só `package.json` e `package-lock.json` mudaram e que `npm run typecheck` passa
- [ ] 1.2 Em `src/main.tsx`, montar a árvore de rotas em código (raiz → `/` com `CarrinhoTela`) dentro do `RouterProvider`, mantendo o `QueryClientProvider`, e verificar que `npx playwright test e2e/revalidar-cotacao.spec.ts` continua passando sem edição

## 2. Busca do catálogo (URL)

- [ ] 2.1 Criar `src/catalogo/buscaDoCatalogo.ts` com o tipo `BuscaDoCatalogo`, os padrões, `validarBusca` (valor inválido → padrão, premissa Q6), as transições `comBusca`/`comCategoria`/`comDisponivel`/`comOrdem` (todas com `pagina: 1`) e `comPagina`, e `parseSearch`/`stringifySearch` em texto simples que omitem padrões e sempre escrevem `pagina`; verificar com `npm run typecheck`
- [ ] 2.2 Ligar `parseSearch`/`stringifySearch` no `createRouter` de `src/main.tsx` e verificar que `/` continua abrindo o Carrinho (`npx playwright test e2e/revalidar-cotacao.spec.ts`)

## 3. Listagem de NFTs na API simulada

- [ ] 3.1 Criar `src/catalogo/contratos.ts` (`NftResumo`, `ListagemNfts`, parâmetros de `GET /api/nfts`) e `src/catalogo/api.ts` (instância Axios própria, `listarNfts(busca, signal)` com `porPagina=12`); verificar com `npm run typecheck`
- [ ] 3.2 Criar `src/catalogo/mocks/db.ts` com as fixtures da decisão 5 do design (30 de "Arte" com ≥13 casando "lua" e alguns sem Edição disponível, 14 de "Música", um NFT com várias Edições de Preços diferentes, `criadoEm` fixo) e verificar com `npm run typecheck`
- [ ] 3.3 Criar `src/catalogo/mocks/handlers.ts` com `GET /api/nfts` aplicando busca sem acento/maiúscula, categoria E disponível, ordem pelo menor Preço entre Edições com desempate por `id`, e fatia de 12 com `total`/`totalPaginas`; verificar com `npm run typecheck`
- [ ] 3.4 Em `src/main.tsx`, criar o worker com os handlers da Compra e do Catálogo e manter `window.__mocks = controleDosMocks`; verificar no navegador (`npm run dev`) que `/api/nfts?categoria=arte&pagina=3` devolve 6 itens e `totalPaginas: 3`, e que `e2e/revalidar-cotacao.spec.ts` continua passando

## 4. Tela Início em `/catalogo`

- [ ] 4.1 Criar `src/catalogo/rota.tsx` (função que recebe a rota pai e devolve a rota `/catalogo` com `validateSearch`) e registrá-la na árvore de `src/main.tsx`; verificar que `/catalogo` abre e a URL ganha `pagina=1` com `replace`
- [ ] 4.2 Criar `src/catalogo/useListagemNfts.ts` (`useQuery` com chave `['catalogo','nfts', busca]`, `signal`, `keepPreviousData`) e `src/catalogo/InicioTela.tsx` com busca (`role="search"`, botão "Buscar"), rádio "Categoria", checkbox "só edições disponíveis", select "Ordenar por", lista `aria-label="NFTs do catálogo"` e paginação com `aria-current="page"`, todos lendo da URL e escrevendo com `navigate`; verificar com `npm run typecheck` e abrindo `/catalogo` no `npm run dev`
- [ ] 4.3 Corrigir `pagina` além de `totalPaginas` com `navigate({ replace: true })` só quando a busca normalizada difere da URL; verificar abrindo `/catalogo?categoria=arte&pagina=99` (vira `pagina=3`) e `/catalogo?pagina=abc&categoria=xyz&ordem=xyz` (vira `pagina=1`) e conferindo que voltar não passa pela URL inválida

## 5. Testes E2E (`e2e/busca-do-catalogo.spec.ts`)

- [ ] 5.1 Escrever o cenário de aceite 1 "refresh mantém a busca do catálogo" (anota os nomes da página 2, `page.reload()`, compara URL e nomes) e verificar que passa com `npx playwright test e2e/busca-do-catalogo.spec.ts`
- [ ] 5.2 Escrever o cenário de aceite 2 "mudar um filtro volta para a página 1" (página 3 de "Arte" → marca "só edições disponíveis" → URL com `categoria=arte`, `disponivel=1`, `pagina=1`; todo item é de "Arte" com edição disponível) e verificar que passa
- [ ] 5.3 Escrever o cenário de aceite 3 "voltar no navegador restaura a busca anterior" (filtra "Arte", vai à página 2, troca para "Música", `page.goBack()` → "Arte" marcado e mesmos nomes da página 2 de "Arte") e verificar que passa
- [ ] 5.4 Escrever os cenários de premissa da spec (Q3, Q4, Q5, Q6, Q8, Q9 e "pedido à API reflete a URL") e verificar que passam

## 6. Verificação final

- [ ] 6.1 Rodar `npm run typecheck`, `npm run build` e `npm run test:e2e` (os dois arquivos E2E) e verificar que todos passam
- [ ] 6.2 Rodar `git status src/compra` e verificar que nada mudou; registrar no PR que `src/compra/mocks/browser.ts` ficou sem uso e que Início está em `/catalogo` (decisões 2 e 5 do design)

## Workflow follow-up

- Mover Início para `/` e o Carrinho para `/carrinho` numa change que possa editar `e2e/revalidar-cotacao.spec.ts`.
- Passar a composição dos workers MSW para um módulo comum numa change que possa tocar `src/compra/`.
- Arquivar a change depois da revisão da aluna.
