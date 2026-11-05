<!--
  Template de Architecture Decision Record (ADR).
  Formato: o de Michael Nygard, "Documenting Architecture Decisions" (2011) — o mais curto
  que existe e o que pegou. Referência: https://adr.github.io/

  Uma ADR por decisão. Não é um documento vivo que você edita pra sempre — se a decisão
  mudar, você cria uma ADR NOVA que substitui a anterior (Status: Superseded by ADR-00X).

  Tamanho esperado: 15 a 40 linhas. Se está passando de 40, ou a decisão é grande demais
  pra uma ADR só, ou você está documentando implementação, não decisão. Corte.

  Nomeie o arquivo: docs/adr/0001-titulo-curto-da-decisao.md (numeração sequencial).
-->

# ADR-0001: <título da decisão, verbo no infinitivo — ex.: "Guardar leads em SQLite em vez de planilha">

## Status

<Proposta | Aceita | Rejeitada | Substituída por ADR-000X>

## Contexto

<!--
  2 a 5 frases. Qual é a dor real (a mesma que você nomeou no Mapa da Dor / RESEARCH.md)?
  Que restrição existe (tempo, gente, dinheiro, dado sensível)? O que force esta decisão
  a existir agora, e não antes?
-->

## Decisão

<!--
  1 a 3 frases, direto. "Vamos fazer X." Não é uma lista de opções — é a escolha, já feita.
  Se cabe em uma frase, é uma frase.
-->

## Alternativas consideradas (opcional)

<!-- Só se ajudar quem ler depois a não repetir a mesma pergunta. Uma linha por alternativa,
     com o motivo de ter sido descartada. Se não teve alternativa real, apague esta seção. -->

## Consequências

<!--
  O que fica mais fácil, o que fica mais difícil, o que essa decisão te impede de fazer
  depois. Toda decisão tem custo — nomeie o custo, não só o benefício.
-->

**Positivas:**
-

**Negativas / trade-offs:**
-

---

<!--
  Régua de tamanho (ver README.md e SLIDES-OUTLINE.md, bloco "escala do documento"):

  - Problema de escala P (CRUD, 1 tela, reversível em 1 commit) → ADR de ~15 linhas,
    sem "Alternativas consideradas". Domínio de exemplo: adicionar um filtro na vitrine
    de perfis (domínio 1 do catálogo).
  - Escala M (cruza confiança entre duas pessoas/times, ou muda um contrato de dado)
    → ADR completa (~25-30 linhas), com 1-2 alternativas descartadas.
  - Escala G (mexe em dado sensível/dinheiro, ou é difícil de reverter) → ADR completa +
    o documento único enxuto (SPEC-ENXUTA-template.md) linkado. Domínio de exemplo:
    trocar como você guarda lead de cliente (domínio 2 do catálogo) de planilha pra banco.
-->
