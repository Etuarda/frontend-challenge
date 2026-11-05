# Spec Delta

## Purpose

Garantir que a Busca do catálogo da tela Início (texto, categoria, "só edições disponíveis",
ordenação e página) viva inteira na URL, para que refresh, voltar/avançar e links diretos mostrem
sempre a mesma lista de NFTs (README §3 Catálogo e detalhe; §9 item 1).

Origem de cada cenário: "cenário de aceite" é um dos três cenários escritos pela aluna; "premissa
Qn" é um padrão aceito pela aluna antes desta change; "README §n" vem direto do enunciado.

## ADDED Requirements

### Requirement: Busca do catálogo na URL
O catálogo SHALL escrever na URL da tela Início o texto da busca, a categoria, o filtro "só
edições disponíveis", a ordenação e a página, com os parâmetros `busca`, `categoria`,
`disponivel`, `ordem` e `pagina`. O parâmetro `pagina` SHALL estar sempre presente, inclusive
quando é 1; os demais SHALL ficar de fora quando estão vazios ou no valor padrão.

#### Scenario: Busca completa aparece na URL (premissas Q2 e Q3)
- **GIVEN** a tela Início
- **WHEN** o colecionador busca "lua", escolhe a categoria "Arte", ordena por "menor preço" e vai para a página 2
- **THEN** a URL tem `busca=lua`, `categoria=arte`, `ordem=menor-preco` e `pagina=2`
- **AND** a URL não tem `disponivel`

#### Scenario: Tela Início sem busca (premissa Q3)
- **WHEN** o colecionador abre a tela Início sem nenhum parâmetro
- **THEN** a URL passa a ter só `pagina=1`
- **AND** a lista mostra a página 1 de todos os NFTs na ordem "mais recentes"

### Requirement: Refresh mantém a Busca do catálogo
Ao abrir a tela Início com uma Busca do catálogo na URL, o catálogo SHALL mostrar nos controles os
valores da URL e SHALL mostrar a lista correspondente a esses valores, sem alterar a URL.

#### Scenario: refresh mantém a busca do catálogo (cenário de aceite 1)
- **GIVEN** que o catálogo tem 30 NFTs de "Arte", mostrados de 12 em 12
- **AND** que o colecionador buscou "lua", filtrou por "Arte", ordenou por "menor preço" e foi para a página 2
- **WHEN** recarrega a página
- **THEN** a URL continua com busca "lua", categoria "Arte", ordem "menor preço" e página 2
- **AND** ele vê os mesmos NFTs da página 2 que via antes do refresh

### Requirement: Página de 12 NFTs
O catálogo SHALL mostrar no máximo 12 NFTs por página. O tamanho da página SHALL ser fixo e não
SHALL aparecer na URL.

#### Scenario: 30 NFTs de "Arte" em três páginas (dados do cenário de aceite 1)
- **GIVEN** que o catálogo tem 30 NFTs de "Arte"
- **WHEN** o colecionador filtra por "Arte"
- **THEN** as páginas 1 e 2 mostram 12 NFTs cada e a página 3 mostra 6

### Requirement: Filtros combináveis
A categoria e o filtro "só edições disponíveis" SHALL combinar por E. A categoria SHALL ser de
escolha única. Um NFT SHALL contar como "edição disponível" quando tem pelo menos 1 Edição com
disponibilidade maior ou igual a 1.

#### Scenario: mudar um filtro volta para a página 1 (cenário de aceite 2)
- **GIVEN** que o colecionador está na página 3 do catálogo filtrado por "Arte"
- **WHEN** adiciona o filtro "só edições disponíveis"
- **THEN** a URL tem os dois filtros e página 1
- **AND** a lista mostra só NFTs de "Arte" com pelo menos 1 edição disponível

### Requirement: Mudança de busca, filtro ou ordenação volta para a página 1
Quando o colecionador muda o texto da busca, a categoria, o filtro "só edições disponíveis" ou a
ordenação, o catálogo SHALL pôr `pagina=1` na URL e mostrar a página 1 da lista nova. Quando muda
só a página, SHALL manter na URL a busca, os filtros e a ordenação.

#### Scenario: Mudar a ordenação volta para a página 1 (premissa Q4)
- **GIVEN** que o colecionador está na página 2 do catálogo filtrado por "Arte"
- **WHEN** ordena por "maior preço"
- **THEN** a URL tem `categoria=arte`, `ordem=maior-preco` e `pagina=1`

#### Scenario: Confirmar novo texto de busca volta para a página 1 (premissa Q4)
- **GIVEN** que o colecionador está na página 2 do catálogo filtrado por "Arte"
- **WHEN** confirma a busca "lua"
- **THEN** a URL tem `busca=lua`, `categoria=arte` e `pagina=1`

#### Scenario: Mudar só a página mantém o resto (premissa Q4)
- **GIVEN** que o colecionador buscou "lua", filtrou por "Arte" e ordenou por "menor preço"
- **WHEN** vai para a página 2
- **THEN** a URL mantém `busca=lua`, `categoria=arte` e `ordem=menor-preco`, com `pagina=2`

### Requirement: Texto da busca entra na URL ao confirmar
O texto da busca SHALL ir para a URL só quando o colecionador confirma (Enter ou botão
"Buscar"). Digitar sem confirmar não SHALL mudar a URL nem a lista.

#### Scenario: Digitar sem confirmar não muda a URL (premissa Q5)
- **GIVEN** a tela Início na página 1
- **WHEN** o colecionador digita "lua" no campo de busca sem apertar Enter nem "Buscar"
- **THEN** a URL continua sem `busca`
- **AND** a lista não muda

### Requirement: Histórico do navegador restaura a Busca do catálogo
Cada busca confirmada e cada mudança de categoria, de "só edições disponíveis", de ordenação ou de
página SHALL criar uma entrada nova no histórico do navegador. Voltar e avançar SHALL restaurar nos
controles e na lista a Busca do catálogo daquela entrada.

#### Scenario: voltar no navegador restaura a busca anterior (cenário de aceite 3)
- **GIVEN** que o colecionador filtrou por "Arte" e depois trocou para "Música"
- **WHEN** aperta o botão voltar do navegador
- **THEN** o filtro "Arte" volta a ficar marcado
- **AND** a lista mostra os NFTs de "Arte" da mesma página em que ele estava

### Requirement: URL inválida volta ao padrão
Quando a URL traz um valor que o catálogo não aceita (página que não é inteiro ≥ 1, categoria ou
ordem desconhecida, `disponivel` diferente de `1`), o catálogo SHALL usar o valor padrão daquele
parâmetro e SHALL corrigir a URL sem criar entrada no histórico. Uma página além da última SHALL
mostrar a última página, também corrigindo a URL sem criar entrada.

#### Scenario: Valores desconhecidos voltam ao padrão (premissa Q6)
- **WHEN** o colecionador abre a tela Início com `pagina=abc&categoria=xyz&ordem=xyz`
- **THEN** a URL passa a ter só `pagina=1`
- **AND** a lista mostra a página 1 de todos os NFTs na ordem "mais recentes"
- **AND** o histórico não ganha entrada nova

#### Scenario: Página além da última mostra a última (premissa Q6)
- **GIVEN** que o catálogo tem 30 NFTs de "Arte"
- **WHEN** o colecionador abre a tela Início com `categoria=arte&pagina=99`
- **THEN** a URL passa a ter `categoria=arte&pagina=3`
- **AND** a lista mostra os 6 NFTs da página 3

### Requirement: Ordenação
O catálogo SHALL oferecer as ordens "mais recentes" (padrão), "menor preço" e "maior preço". Nas
ordens por Preço, cada NFT SHALL ser ordenado pelo menor Preço atual entre as suas Edições.

#### Scenario: Menor preço usa a Edição mais barata (premissa Q8)
- **GIVEN** um NFT de "Arte" com Edições de 0,40 ETH e 0,10 ETH e outro com uma única Edição de 0,20 ETH
- **WHEN** o colecionador filtra por "Arte" e ordena por "menor preço"
- **THEN** o NFT com a Edição de 0,10 ETH aparece antes do NFT de 0,20 ETH

### Requirement: Busca por trecho do nome
O texto da busca SHALL casar com qualquer trecho do nome do NFT, sem diferenciar maiúsculas nem
acentos.

#### Scenario: "lua" casa sem diferenciar maiúsculas e acentos (premissa Q9)
- **GIVEN** NFTs chamados "Lua Cheia", "Luá Nova", "Luar #3" e "Sol #1"
- **WHEN** o colecionador busca "lua"
- **THEN** a lista mostra "Lua Cheia", "Luá Nova" e "Luar #3"
- **AND** não mostra "Sol #1"

### Requirement: Listagem de NFTs aplica a Busca do catálogo na API
A listagem de NFTs SHALL ser pedida à API com os mesmos valores da URL (busca, categoria,
disponibilidade, ordem e página) e a API SHALL aplicar busca, filtros, ordenação e paginação antes
de responder. A tela SHALL mostrar a lista na ordem que a API devolve.

#### Scenario: Pedido à API reflete a URL (README §3 e §5)
- **WHEN** a tela Início abre com `busca=lua&categoria=arte&ordem=menor-preco&pagina=2`
- **THEN** a API recebe um pedido de listagem com busca "lua", categoria "arte", ordem "menor-preco", página 2 e 12 itens por página
