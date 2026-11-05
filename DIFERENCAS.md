# DIFERENCAS — busca do catálogo na URL (semana 5, TLC)

Régua: os 3 cenários de [`semana5/CENARIOS-A-MAO.md`](semana5/CENARIOS-A-MAO.md), commitados antes de instalar a ferramenta. Spec do TLC: [`.specs/features/busca-do-catalogo-na-url/spec.md`](.specs/features/busca-do-catalogo-na-url/spec.md).

- **Acrescentou:** critérios que nenhum cenário meu tinha: "avançar" no histórico (BUSCA-15, tirado da minha frase "voltar/avançar") e "a API aplica busca, filtros, ordenação e paginação antes de responder" (BUSCA-06, do README §3 e §5).
- **Mudou nos meus cenários:** não reescreveu nenhum, mas quebrou os 3 em 15 critérios EARS, trocou "eu" por "o colecionador" e transformou o meu "de 12 em 12" numa premissa ("12 por página, fixo, fora da URL") que pede confirmação.
- **Perguntou:** 10 perguntas, e a primeira desmonta o meu pedido: "só `src/catalogo/` não basta" (rota, `main.tsx` e testes ficam fora dessa pasta). Parou sem se dar como aprovado.

## TLC × OpenSpec (faixa completa)

Change do OpenSpec: [`openspec/changes/busca-do-catalogo-na-url/`](openspec/changes/busca-do-catalogo-na-url/) (`openspec validate` = válida). **Quem perguntou mais foi o TLC**: 10 perguntas, Edge Cases deixados em branco até eu responder e a linha `Approved` proibida sem as minhas palavras. O OpenSpec também parou antes de criar a change, mas leu a spec do TLC que estava no repositório e reaproveitou as mesmas perguntas já com respostas padrão. Por isso a comparação não é independente: a segunda ferramenta herdou o trabalho da primeira. **Quem inventou mais foi o OpenSpec**: 9 cenários além dos meus 3 (marcados como premissas), a tela Início em `/catalogo` em vez de `/` decidida sozinho, e uma URL montada à mão com `pushState` que contrariava o README (§4 exige TanStack Router) e só saiu porque eu corrigi. Neste projeto eu usaria o **TLC**: o desafio tem regras ambíguas e critérios eliminatórios, e aqui o custo de uma pergunta a mais é menor que o de uma premissa errada virar código. O OpenSpec eu deixaria para mudanças pequenas e já bem decididas, em que a change curta e o `validate` rápido compensam.
