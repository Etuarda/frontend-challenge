<!--
  O DOCUMENTO ÚNICO ENXUTO. Isto substitui PRD + Design Doc como dois arquivos
  separados — esta semana corta essa separação de propósito. Um documento, curto,
  que qualquer pessoa do time lê em menos de 5 minutos.

  Nasce na SESSÃO 2 (Plan), lendo o RESEARCH.md da sessão 1 como único contexto de
  entrada. Se a sessão de Plan não tiver o RESEARCH.md na frente, ela vai inventar
  problema — e você não vai ter como saber, porque o texto vai sair bonito do mesmo jeito.

  Tamanho-alvo: ver a régua "escala do documento vs escala do problema" no README.md.
  Escala P: normalmente você nem precisa deste arquivo, só a ADR já resolve.
  Escala M: isto aqui, ~1 página (60-100 linhas com os EARS e BDD inclusos).
  Escala G: isto aqui pode passar de 1 página, mas se passar de 3, provavelmente você
  está documentando implementação, não decisão — separe em mais de uma ADR.
-->

# <nome do artefato/feature> — spec

**Bounded context (semana 5):** <nome do contexto ao qual isto pertence>
**ADR relacionada:** <link pra `docs/adr/000X-....md`, se esta decisão tiver uma>
**Escala:** <P | M | G> — ver régua no README.md

## Contexto

<!--
  3 a 5 frases. Isto é o resumo do RESEARCH.md, não uma reescrita dele — copie a dor,
  não a suavize. Se você "melhorou" a redação a ponto de ela não soar mais como uma
  reclamação real, você já perdeu a informação que importa.
-->

## Decisão

<!-- O que vamos construir. 2-4 frases, direto, sem lista de opções — a decisão já foi
     tomada (é isso que a ADR registra, se existir uma). -->

## Fora de escopo

<!-- O que isto explicitamente NÃO resolve agora. Tão importante quanto a decisão —
     é o que impede o agente de "ser útil demais" e inflar o trabalho. -->

-
-

## Critérios (EARS)

<!-- Mínimo 5. Use o gabarito de `EARS-BDD-template.md`. Cole aqui só os critérios finais,
     já revisados contra o RESEARCH.md — não o rascunho do agente. -->

1.
2.
3.
4.
5.

## Cenários (BDD)

<!-- Mínimo 3, formato Gherkin. Estes viram teste na semana 8 — escreva pensando nisso. -->

```gherkin
Cenário:
Dado
Quando
Então
```

## Como eu vou saber que funcionou

<!-- O comando ou verificação que confirma que os critérios acima estão implementados.
     Ex.: "npm test roda os 3 cenários de cima e todos passam". -->

## Linguagem ubíqua usada aqui

<!-- Liste os termos do domínio (da semana 5) usados neste documento, com uma frase de
     definição cada — garante que quem ler depois usa a mesma palavra pro mesmo conceito. -->

| Termo | O que significa neste projeto |
|---|---|
| | |
