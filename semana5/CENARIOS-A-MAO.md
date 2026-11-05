# Cenários escritos antes da ferramenta (semana 5)

Feature: **busca do catálogo que sobrevive ao refresh** — contexto Catálogo (`src/catalogo/`).

Regra em uma frase: a busca do catálogo (texto, filtros, ordenação e página) fica inteira na URL,
então refresh e voltar/avançar do navegador mostram exatamente a mesma lista; mudar um filtro
volta para a página 1.

> Rascunho feito pelo agente (Claude) numa etapa separada, **antes** de instalar ou abrir o TLC
> e o OpenSpec, a pedido da aluna, com os termos do `GLOSSARIO.md`. Não foi editado depois de
> rodar as ferramentas — é a régua do `DIFERENCAS.md`.

```gherkin
Cenário: refresh mantém a busca do catálogo
  Dado que o catálogo tem 30 NFTs de "Arte", mostrados de 12 em 12
  E que busquei "lua", filtrei por "Arte", ordenei por "menor preço" e fui para a página 2
  Quando recarrego a página
  Então a URL continua com busca "lua", categoria "Arte", ordem "menor preço" e página 2
  E vejo os mesmos NFTs da página 2 que via antes do refresh
```

```gherkin
Cenário: mudar um filtro volta para a página 1
  Dado que estou na página 3 do catálogo filtrado por "Arte"
  Quando adiciono o filtro "só edições disponíveis"
  Então a URL tem os dois filtros e página 1
  E a lista mostra só NFTs de "Arte" com pelo menos 1 edição disponível
```

```gherkin
Cenário: voltar no navegador restaura a busca anterior
  Dado que filtrei por "Arte" e depois troquei para "Música"
  Quando aperto o botão voltar do navegador
  Então o filtro "Arte" volta a ficar marcado
  E a lista mostra os NFTs de "Arte" da mesma página em que eu estava
```
