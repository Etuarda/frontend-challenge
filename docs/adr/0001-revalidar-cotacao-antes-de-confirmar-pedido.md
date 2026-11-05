# ADR-0001: Revalidar a Cotação e exigir novo aceite antes de confirmar o Pedido

## Status

Proposta

## Contexto

O colecionador monta um Carrinho com NFTs de edição limitada e volta ao catálogo por 10 a 20
minutos antes de pagar. Nesse tempo, o Preço no Catálogo pode subir ou cair, a edição pode
esgotar, o cupom pode deixar de valer e a taxa pode mudar. Hoje ninguém avisa: o Carrinho
continua mostrando o total antigo, e ele só descobre a diferença na carteira, no Recibo ou
nunca ("Eu vi 0,75 ETH no carrinho. Por que a carteira está pedindo 0,82?"). Para ele, o total
do Carrinho é a promessa. Confirmar uma compra com valor errado, ou sem resposta da simulação,
é eliminatório (README §11).

## Decisão

Antes de confirmar, o fluxo de Compra pede uma Cotação nova e compara com a última que o
colecionador aceitou. Se algo mudou (Preço, disponibilidade, cupom, taxa ou total), o Pedido não
é enviado: mostramos o que mudou, item por item, e o colecionador precisa aceitar a nova Cotação
de forma explícita. Sem Cotação nova válida, não há confirmação.

## Alternativas consideradas

- **Deixar o colecionador conferir à mão (como hoje):** descartada. É manual, chega atrasada e
  não protege quem não sabe que precisa conferir.
- **Atualizar o Carrinho em tempo real enquanto ele navega no catálogo:** adiada. Custa mais e
  não fecha o buraco do último segundo, porque a checagem no momento de confirmar continuaria
  sendo necessária.
- **Congelar o Preço no momento em que o item entra no Carrinho:** descartada. Depende de o
  marketplace garantir o preço, e nada no contexto da API indica que isso existe.

## Consequências

**Positivas:**
- O colecionador nunca paga um total que não aceitou. O Preço da Compra passa a ser sempre o da
  Cotação aceita.
- Edição esgotada aparece antes da carteira, não depois.
- Cobre o caso eliminatório: sem resposta da Cotação, não há confirmação.

**Negativas / trade-offs:**
- Mais um passo e mais uma espera antes de pagar, mesmo quando nada mudou.
- Mais chamadas de Cotação à API.
- O colecionador continua sem aviso *enquanto* navega. Ele só fica sabendo ao voltar ao Carrinho
  ou ao confirmar.
- Uma mudança entre o novo aceite e a confirmação ainda pode acontecer. Nesse caso dependemos de
  a API recusar o Pedido com Cotação desatualizada, e o fluxo volta para a comparação.
