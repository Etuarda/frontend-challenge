# ADR-0001: Avisar alterações no Carrinho aberto e revalidar a Cotação antes de confirmar o Pedido

## Status

Aceita

## Contexto

O colecionador monta um Carrinho com NFTs de edição limitada e volta ao catálogo por 10 a 20
minutos antes de pagar. Nesse tempo o Preço pode subir ou cair, a edição pode esgotar e o cupom
pode deixar de valer. Hoje ninguém avisa: o Carrinho mostra o total antigo, e ele só descobre na
carteira, no Recibo ou nunca ("Eu vi 0,75 ETH no carrinho. Por que a carteira está pedindo
0,82?"). Para ele, o total do Carrinho é a promessa. O README exige refletir as alterações com o
Carrinho aberto (§3, §7) e trata compra confirmada sem resposta da simulação como eliminatória
(§11).

## Decisão

Com o Carrinho aberto, cada alteração de Preço ou disponibilidade é mostrada na hora (antigo →
novo), o resumo é atualizado e a Cotação aceita passa a ser desatualizada. Na confirmação, o
fluxo pede uma Cotação nova e só envia o Pedido se ela bater com a aceita; sem Cotação válida,
não há Pedido.

## Alternativas consideradas

- **Só revalidar na confirmação, sem aviso no Carrinho:** descartada. É a proposta da sessão de
  Plan, mas deixa o colecionador olhando o número antigo, que é a fala do RESEARCH, e não cumpre
  o §7 do README.
- **Congelar o Preço quando o item entra no Carrinho:** descartada. Nada no contexto indica que o
  marketplace garante preço.

## Consequências

**Positivas:**
- O colecionador nunca envia um Pedido com total que não aceitou, e vê a mudança antes da carteira.

**Negativas / trade-offs:**
- Mais um passo antes de pagar quando algo mudou, e mais chamadas de Cotação à API.
- O Carrinho passa a depender de receber alterações em tempo real; se a conexão cair, só a
  revalidação na confirmação protege.
