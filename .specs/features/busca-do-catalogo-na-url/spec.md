# Busca do catálogo na URL Specification

**Approved**: pendente - aguardando as respostas das perguntas abertas

## Problem Statement

Na tela Início, o colecionador monta uma **Busca do catálogo**: texto, filtros, ordenação e
página. Hoje (não existe código de Catálogo) nada garante que essa busca sobreviva a um refresh
ou ao voltar/avançar do navegador, e o README exige isso (§3 Catálogo e detalhe; §9 item 1). A
feature põe a Busca do catálogo inteira na URL: a mesma URL mostra sempre a mesma lista, e mudar
um filtro volta para a página 1.

## Goals

- [ ] Recarregar a tela Início mostra os mesmos NFTs, na mesma ordem e na mesma página (cenário 1).
- [ ] Mudar um filtro sempre leva à página 1 (cenário 2).
- [ ] Voltar e avançar no navegador restauram a Busca do catálogo de cada entrada do histórico (cenário 3).

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Contexto Compra (Carrinho, Cotação, Pedido, Recibo) e qualquer arquivo de `src/compra/` | Pedido da aluna: "o contexto Compra fica fora do escopo" |
| Detalhes do NFT, favoritos, destaques | Outras funcionalidades da tela Início/Detalhes (§3); não estão nos cenários |
| Atualização de Preço e disponibilidade em tempo real no catálogo (`nft.updated`) | §7 pede, mas nenhum cenário desta feature cobre |
| Fidelidade visual ao Figma e regressão visual | Esta feature especifica comportamento; a tela Início no Figma é outra entrega (ver Q10) |
| Skeletons, resultado vazio, falha da API e respostas fora de ordem | §3 e §4 pedem, mas nenhum cenário cobre; ver Q7 |

---

## Assumptions & Open Questions

Defaults que os próprios cenários ou o código resolvem:

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Tamanho da página | 12 NFTs por página, fixo, fora da URL | Cenário 1: "mostrados de 12 em 12" | n |
| Categoria é escolha única | Escolher "Música" tira "Arte" | Cenário 3: "filtrei por Arte e depois troquei para Música" e, ao voltar, "Arte volta a ficar marcado" | n |
| Filtros combináveis | Categoria e "só edições disponíveis" combinam por E | Cenário 2 ("só NFTs de Arte com pelo menos 1 edição disponível") e §3 "Filtros devem ser combináveis" | n |
| "Edição disponível" | Edição com disponibilidade ≥ 1 | Cenário 2: "pelo menos 1 edição disponível" | n |
| Onde filtrar, ordenar e paginar | Na API (`GET` de listagem de NFTs, handler MSW); a tela só envia os parâmetros da URL e mostra a resposta | §3 "As consultas devem refletir os parâmetros enviados à API"; §5 NFTs "Listagem com busca/filtros/ordenação/paginação" | n |
| Fixture de teste | O cenário padrão dos mocks tem 30 NFTs de "Arte" (alguns com "lua" no nome e alguns sem edição disponível) e NFTs de "Música" suficientes para mais de 1 página | Os três cenários precisam desses dados; §6 pede fixtures "com variedade suficiente para exercitar filtros e paginação" | n |
| "Mesmos NFTs" depois do refresh | Vale enquanto o catálogo não muda entre os dois carregamentos | Sem tempo real nesta feature (Out of Scope) | n |

**Open questions** - decisões de produto que bloqueiam a aprovação (minha recomendação entre parênteses):

- **Q1. Escopo de arquivos.** A feature não fecha só com `src/catalogo/`: precisa instalar `@tanstack/react-router` em `package.json`, trocar a tela fixa `CarrinhoTela` em `src/main.tsx` por um roteador, registrar os handlers MSW do Catálogo no worker (hoje em `src/compra/mocks/browser.ts`) e pôr o teste E2E em `e2e/`. Quais desses posso tocar? (Recomendo: `package.json`, `src/main.tsx` e `e2e/busca-do-catalogo.spec.ts`; os mocks do Catálogo ficam em `src/catalogo/mocks/` e entram no worker por uma linha em `src/main.tsx`, sem tocar em `src/compra/`.)
- **Q2. Nomes dos parâmetros na URL.** (Recomendo `?busca=lua&categoria=arte&disponivel=1&ordem=menor-preco&pagina=2`, em português, como os termos do glossário.)
- **Q3. Valores padrão na URL.** Página 1, ordem padrão e filtros vazios aparecem na URL ou ficam de fora? O cenário 2 diz "a URL tem os dois filtros e página 1". (Recomendo: sempre escrever `pagina`, inclusive `pagina=1`, para o cenário 2 ser lido literalmente; os demais parâmetros vazios ficam de fora.)
- **Q4. Quais mudanças voltam para a página 1.** A regra fala em "filtro". Mudar o texto da busca e mudar a ordenação também voltam para a página 1? (Recomendo: sim para os dois; só mudar de página mantém o resto.)
- **Q5. Histórico ao digitar.** Cada filtro, ordenação e página cria uma entrada no histórico (o cenário 3 precisa disso). O texto da busca entra na URL a cada tecla ou ao confirmar (Enter/botão)? E cria entrada no histórico? (Recomendo: entra na URL ao confirmar e cria uma entrada; digitar sem confirmar não muda a URL.)
- **Q6. URL inválida.** O que fazer com `pagina=0`, `pagina=abc`, `pagina=99` (além da última), `categoria=inexistente` ou `ordem=inexistente` vindos de link ou edição manual? (Recomendo: valor que não é aceito volta ao padrão e a URL é corrigida sem criar entrada no histórico; página além da última mostra a última página.)
- **Q7. Estados da lista.** Resultado vazio, falha da API e respostas fora de ordem (§3) entram nesta feature ou ficam para outra? (Recomendo: outra feature; aqui fica só a garantia de que a lista mostrada é a da URL atual.)
- **Q8. Ordenação por Preço com edições de preços diferentes.** No mock atual o Preço é por edição. "Menor preço" ordena cada NFT por qual valor? E quais são as ordenações oferecidas além de "menor preço"? (Recomendo: o menor Preço atual entre as edições do NFT; opções "mais recentes" (padrão), "menor preço" e "maior preço" — a confirmar contra o Figma.)
- **Q9. Busca por texto.** "lua" casa com o quê? (Recomendo: trecho do nome do NFT, sem diferenciar maiúsculas nem acentos — "Lua", "luá" e "Luar" casam.)
- **Q10. Figma.** O frame da tela Início no Figma vale como fonte obrigatória para os controles desta feature (rótulos dos filtros e das ordenações)? Se sim, preciso dele exportado em `captures/`. (Recomendo: não nesta feature; usar os rótulos dos cenários: "Arte", "Música", "só edições disponíveis", "menor preço".)

---

## User Stories

### P1: Refresh mantém a Busca do catálogo ⭐ MVP

**User Story**: Como colecionador, quero que recarregar a tela Início mostre a mesma lista para não perder a busca que montei.

**Why P1**: É o cenário 1 e a frase central do §3 ("sobreviver a refresh").

**Acceptance Criteria**:

1. WHEN o colecionador muda o texto da busca, a categoria, o filtro "só edições disponíveis", a ordenação ou a página THEN o catálogo SHALL escrever o valor novo na URL da tela Início  <!-- event-driven; formato em Q2/Q3/Q5 -->
2. WHEN a tela Início abre com uma URL que tem busca "lua", categoria "Arte", ordem "menor preço" e página 2 THEN o catálogo SHALL pedir à API a listagem com exatamente esses quatro valores  <!-- event-driven; §3 "refletir os parâmetros enviados à API" -->
3. WHEN a tela Início abre com uma URL que tem uma Busca do catálogo THEN o catálogo SHALL mostrar o campo de busca, a categoria, o filtro "só edições disponíveis" e a ordenação com os valores da URL  <!-- event-driven -->
4. WHEN o colecionador recarrega a tela Início THEN o catálogo SHALL manter a URL igual e mostrar os mesmos NFTs, na mesma ordem, que mostrava antes do refresh  <!-- event-driven; cenário 1 -->
5. The catálogo SHALL mostrar no máximo 12 NFTs por página  <!-- ubiquitous; cenário 1 -->
6. The API de listagem de NFTs SHALL aplicar busca, filtros, ordenação e paginação antes de responder  <!-- ubiquitous; §3, §5 -->

**Independent Test**: Com 30 NFTs de "Arte" no mock, buscar "lua", filtrar "Arte", ordenar por "menor preço", ir à página 2, anotar a URL e os NFTs, recarregar e comparar.

---

### P1: Mudar um filtro volta para a página 1 ⭐ MVP

**User Story**: Como colecionador, quero que mudar um filtro me leve à página 1 para não cair numa página vazia ou no meio de uma lista nova.

**Why P1**: É o cenário 2 e a frase "mudança de filtro deve reiniciar a paginação" (§3).

**Acceptance Criteria**:

1. WHEN o colecionador marca, desmarca ou troca a categoria ou o filtro "só edições disponíveis" THEN o catálogo SHALL pôr página 1 na URL e mostrar a página 1 da lista nova  <!-- event-driven; cenário 2 -->
2. WHEN o colecionador adiciona um filtro com outro já marcado THEN o catálogo SHALL manter os dois filtros na URL  <!-- event-driven; cenário 2 -->
3. WHILE a categoria "Arte" e o filtro "só edições disponíveis" estão marcados o catálogo SHALL mostrar só NFTs de "Arte" com pelo menos 1 edição com disponibilidade ≥ 1  <!-- state-driven; cenário 2 -->
4. WHEN o colecionador muda o texto da busca ou a ordenação THEN o catálogo SHALL pôr página 1 na URL  <!-- event-driven; PENDENTE Q4 -->
5. WHEN o colecionador muda só a página THEN o catálogo SHALL manter na URL a busca, os filtros e a ordenação  <!-- event-driven -->

**Independent Test**: Na página 3 de "Arte", marcar "só edições disponíveis" e conferir URL (dois filtros, página 1) e lista.

---

### P1: Voltar e avançar restauram a Busca do catálogo ⭐ MVP

**User Story**: Como colecionador, quero usar voltar e avançar do navegador para rever buscas anteriores sem refazê-las.

**Why P1**: É o cenário 3 e o §9 item 1 ("restauração pelo histórico").

**Acceptance Criteria**:

1. WHEN o colecionador muda a categoria, o filtro "só edições disponíveis", a ordenação ou a página THEN o catálogo SHALL criar uma entrada nova no histórico do navegador  <!-- event-driven; texto da busca em Q5 -->
2. WHEN o colecionador aperta voltar do navegador THEN o catálogo SHALL marcar nos controles os valores da entrada anterior  <!-- event-driven; cenário 3 -->
3. WHEN o colecionador aperta voltar do navegador THEN o catálogo SHALL mostrar os NFTs da página e dos filtros da entrada anterior  <!-- event-driven; cenário 3 -->
4. WHEN o colecionador aperta avançar do navegador depois de voltar THEN o catálogo SHALL marcar os controles e mostrar os NFTs da entrada seguinte  <!-- event-driven; pedido: "voltar/avançar do navegador mostram exatamente a mesma lista" -->

**Independent Test**: Filtrar "Arte", ir à página 2, trocar para "Música", apertar voltar e conferir "Arte" marcado e os NFTs da página 2 de "Arte"; apertar avançar e conferir "Música".

---

## Edge Cases

Dependem das respostas de Q6 e Q7; escrevo os critérios depois delas.

- IF a URL traz um valor que o catálogo não aceita THEN o catálogo SHALL [Q6]
- IF a URL traz uma página além da última THEN o catálogo SHALL [Q6]

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| BUSCA-01 | P1: Refresh mantém a Busca do catálogo - AC1 | - | Pending |
| BUSCA-02 | P1: Refresh mantém a Busca do catálogo - AC2 | - | Pending |
| BUSCA-03 | P1: Refresh mantém a Busca do catálogo - AC3 | - | Pending |
| BUSCA-04 | P1: Refresh mantém a Busca do catálogo - AC4 | - | Pending |
| BUSCA-05 | P1: Refresh mantém a Busca do catálogo - AC5 | - | Pending |
| BUSCA-06 | P1: Refresh mantém a Busca do catálogo - AC6 | - | Pending |
| BUSCA-07 | P1: Mudar um filtro volta para a página 1 - AC1 | - | Pending |
| BUSCA-08 | P1: Mudar um filtro volta para a página 1 - AC2 | - | Pending |
| BUSCA-09 | P1: Mudar um filtro volta para a página 1 - AC3 | - | Pending |
| BUSCA-10 | P1: Mudar um filtro volta para a página 1 - AC4 | - | Pending |
| BUSCA-11 | P1: Mudar um filtro volta para a página 1 - AC5 | - | Pending |
| BUSCA-12 | P1: Voltar e avançar restauram a Busca do catálogo - AC1 | - | Pending |
| BUSCA-13 | P1: Voltar e avançar restauram a Busca do catálogo - AC2 | - | Pending |
| BUSCA-14 | P1: Voltar e avançar restauram a Busca do catálogo - AC3 | - | Pending |
| BUSCA-15 | P1: Voltar e avançar restauram a Busca do catálogo - AC4 | - | Pending |

**Coverage:** 15 total, 0 mapped to tasks (Tasks ainda não começou).

---

## Sources

- `README.md` §3 Catálogo e detalhe - busca, filtros, ordenação e paginação na URL; filtros combináveis; mudança de filtro reinicia a paginação; consultas refletem os parâmetros enviados à API.
- `README.md` §5 NFTs - listagem com busca/filtros/ordenação/paginação.
- `README.md` §9 item 1 - teste E2E de busca, filtros combinados, ordenação, paginação e restauração pelo histórico.
- `semana5/CENARIOS-A-MAO.md` - os três cenários Gherkin desta feature.
- `CLAUDE.md` - glossário (NFT, Edição, Busca do catálogo, Preço no Catálogo).

---

## Success Criteria

- [ ] Os três cenários de `semana5/CENARIOS-A-MAO.md` passam como testes Playwright com os mocks MSW.
- [ ] Nenhum arquivo de `src/compra/` muda.
