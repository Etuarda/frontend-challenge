# Proposal

## Why

O README exige que "busca, filtros, ordenação e paginação" componham "o estado da URL e
sobrevivam a refresh e navegação pelo histórico", e que "mudança de filtro" reinicie "a
paginação" (§3 Catálogo e detalhe; §9 item 1). Hoje não existe tela de Catálogo: o app abre direto
no Carrinho (`src/main.tsx`), então nenhuma **Busca do catálogo** sobrevive a nada.

## What Changes

- Nova tela Início do Catálogo com campo de busca, categoria ("Arte", "Música"), filtro "só
  edições disponíveis", ordenação e paginação de 12 NFTs por página.
- A **Busca do catálogo** inteira (texto, categoria, "só edições disponíveis", ordem e página)
  passa a viver na URL: refresh e voltar/avançar mostram a mesma lista.
- Mudar texto, filtro ou ordenação volta para a página 1; mudar só a página mantém o resto.
- Valores inválidos na URL voltam ao padrão sem criar entrada no histórico.
- Nova listagem de NFTs na API simulada (MSW) que aplica busca, filtros, ordenação e paginação,
  com fixtures suficientes para os três cenários de aceite.
- O app passa a ter roteamento (TanStack Router, exigido pelo README §2 e §4); o Carrinho
  continua acessível na rota atual.

### Critério de aceite

Os três cenários da aluna, sem acréscimos: "refresh mantém a busca do catálogo", "mudar um
filtro volta para a página 1" e "voltar no navegador restaura a busca anterior". Todo o
restante na spec é premissa aceita pela aluna (Q2 a Q10) e está marcado assim.

### Fora do escopo

- Contexto Compra (`src/compra/`): nenhum arquivo muda.
- Detalhes do NFT, destaques, favoritos, Preço em tempo real (`nft.updated`) no catálogo.
- Resultado vazio, falha da API, skeletons e respostas fora de ordem como estados de tela (Q7).
- Fidelidade ao Figma (Q10): os rótulos vêm dos cenários.

## Capabilities

### New Capabilities

- `busca-do-catalogo`: a Busca do catálogo na tela Início — o que vai para a URL, como a URL é
  lida de volta (refresh, histórico, link direto, valores inválidos), quando a página volta para
  1 e o que a listagem de NFTs devolve para cada combinação de busca, filtros, ordem e página.

### Modified Capabilities

Nenhuma (`openspec/specs/` está vazio).

## Impact

- **Código novo**: `src/catalogo/` (rota da tela Início, contrato e cliente da listagem,
  componentes, mocks MSW do Catálogo).
- **Código alterado fora de `src/catalogo/`** (combinado com a aluna): `src/main.tsx` (monta o
  roteador e registra os mocks do Catálogo junto dos da Compra) e o novo
  `e2e/busca-do-catalogo.spec.ts`.
- **Dependência nova**: `@tanstack/react-router` em `package.json`/`package-lock.json`,
  consequência da exigência do README de usar TanStack Router nos parâmetros de busca.
- **API simulada**: novo `GET /api/nfts` (só no MSW).
- **Compra**: `src/compra/` intacto; o teste `e2e/revalidar-cotacao.spec.ts` precisa continuar
  passando sem edição.
