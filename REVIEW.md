# REVIEW — semanas 5 e 6

## O que eu pedi na sessão de Plan

Numa sessão nova, colei só o `RESEARCH.md` (o total do Carrinho muda sem o colecionador saber),
o nome do contexto **Compra** e os 5 termos dele do glossário. Pedi a ADR e a spec enxuta, com
5 EARS (um de cada padrão) e 3 cenários BDD, sem código. Prompts e respostas de cada sessão
estão no PDF da entrega.

## O que o agente devolveu

Uma ADR e uma spec bem escritas (commit `ec1cf98`, intacto) com uma decisão só: **revalidar a
Cotação na hora de confirmar**. Avisar a mudança com o Carrinho aberto ficou "adiado", fora de
escopo.

## O que eu rejeitei ou reescrevi (commit `1552818`)

- **Tempo real voltou ao escopo.** O agente adiou exatamente a fala do RESEARCH ("Ninguém avisa.
  O carrinho continua mostrando o número antigo") e o que o README exige (§3 Carrinho: "Refletir
  alterações [...] enquanto o carrinho estiver aberto"; §7 passos 3 e 4). A ADR passou a ter as
  duas defesas, e a proposta do agente virou alternativa descartada, com o motivo.
- **EARS 2 trocado.** Era "quando o colecionador pedir para confirmar, peça uma Cotação nova".
  Virou "quando chegar uma alteração de Preço ou disponibilidade [...], o Carrinho deve avisar e
  atualizar o resumo". A revalidação na confirmação foi para o critério 1.
- **Cada EARS ganhou origem.** Tabela com a frase do RESEARCH.md e a seção do README ao lado.
  Nenhum critério ficou sem origem, então nenhum foi apagado.
- **BDD 1 e 2 mudaram de gatilho.** Eram "quando pede para confirmar e a Cotação nova traz...".
  Viraram "quando chega a alteração...", para testar o aviso no Carrinho aberto. O BDD 3 (erro: a
  Cotação falha) foi mantido, com a mensagem exata e "os 2 itens continuam no Carrinho", para dar
  para verificar.
- **"Subtotal" no lugar de "total".** 0,45 + 0,30 = 0,75 é o subtotal; o total tem taxa. Isso
  deixou os números do cenário 1 conferíveis (0,75 → 0,82).
- **ADR cortada** de 48 para 40 linhas, dentro da régua de escala M, e com status **Aceita**.

## O que a sessão de Implement perguntou (commit `00e4d70`)

Ela parou antes de escrever código com 4 perguntas, e a primeira achou uma contradição que me
escapou na revisão. O critério 1 dizia "o resumo mostra o total da Cotação aceita", e o cenário 1
dizia "o subtotal passa a 0,82" antes do aceite. Respondi na própria spec: a Cotação nova vem da
API e aparece como "aguardando aceite", e nada é calculado na tela. "Bater" quer dizer itens, cupom,
taxa e total iguais. Com item esgotado, não há aceite. Remover o item é de outra spec.

## Resultado

`npx playwright test` dá 3 passed (Chromium). Rodei de novo fora da sessão do agente, e o `tsc
--noEmit` também ficou limpo. Os testes leem os Pedidos recebidos pelo servidor simulado, não só
a tela. Na sessão de Implement, desligar o bloqueio da confirmação de propósito quebrou os
cenários 1 e 2.

O que ficou de fora: as rotas (TanStack Router), shadcn/ui, login, o pagamento, a idempotência
real, o deploy e o resto do desafio.

## Como rodar

```
npm install
npx playwright install chromium
npx playwright test      # os 3 cenários BDD
npm run dev              # a tela do Carrinho, com os mocks
```
