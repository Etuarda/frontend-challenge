# Revalidação da Cotação antes de confirmar o Pedido — spec

**Bounded context (semana 5):** Compra
**ADR relacionada:** [`docs/adr/0001-revalidar-cotacao-antes-de-confirmar-pedido.md`](adr/0001-revalidar-cotacao-antes-de-confirmar-pedido.md)
**Escala:** M — muda o contrato entre o total mostrado ao colecionador e o valor cobrado

## Contexto

O colecionador coloca no Carrinho um NFT de 0,45 ETH e outro de 0,30 ETH (total de 0,75 ETH +
taxa) e volta ao catálogo por 10 a 20 minutos. Enquanto isso, o primeiro sobe para 0,52 ETH, ou
a edição esgota, e ninguém avisa. O Carrinho continua mostrando o número antigo, e ele só
descobre na carteira, no Recibo ou nunca: *"Eu vi 0,75 ETH no carrinho. Por que a carteira está
pedindo 0,82? Ninguém me avisou que mudou."* O que mais dói, em ordem: o preço subir, a edição
esgotar e o preço cair. Conferir à mão não resolve, porque a mudança pode vir no último segundo.
*(Papel, fala e números são reconstrução. Ver RESEARCH.md.)*

## Decisão

Antes de enviar o Pedido, o fluxo de Compra pede uma Cotação nova e compara com a última que o
colecionador aceitou. Se o Preço, a disponibilidade, o cupom, a taxa ou o total mudaram, o
Pedido não é enviado. O Carrinho mostra o que mudou, item por item, com o valor antigo e o novo,
e só segue depois que o colecionador aceita a nova Cotação. Sem Cotação nova válida, não há
confirmação.

## Fora de escopo

- Avisar a mudança em tempo real enquanto o colecionador navega pelo catálogo.
- Reservar a edição ou congelar o Preço quando o item entra no Carrinho.
- Medir com que frequência o Preço ou a disponibilidade mudam durante uma sessão, e quanto da
  desistência vem disso. Continua sendo pergunta aberta do RESEARCH.md.
- Sugerir outra peça quando a edição esgota.
- Mudar o Recibo. Ele continua sendo o snapshot do Pedido confirmado.

## Critérios (EARS)

1. **Ubíqua:** O fluxo de Compra deve enviar o Pedido somente com a última Cotação aceita pelo
   colecionador, e o total mostrado no Carrinho deve ser o total dessa Cotação.
2. **Orientada a evento:** Quando o colecionador pedir para confirmar a compra, o fluxo de Compra
   deve pedir uma Cotação nova e compará-la com a última Cotação aceita antes de enviar o
   Pedido.
3. **Orientada a estado:** Enquanto a Cotação nova divergir da última Cotação aceita (Preço,
   disponibilidade, cupom, taxa ou total), o Carrinho deve mostrar o valor antigo e o novo de
   cada item que mudou e manter a confirmação bloqueada até o colecionador aceitar a nova
   Cotação.
4. **Feature opcional:** Onde o Carrinho tiver cupom aplicado, o fluxo de Compra deve
   revalidar o cupom na Cotação nova e, se ele deixou de valer, mostrar isso como divergência
   antes de qualquer confirmação.
5. **Comportamento indesejado:** Se a Cotação nova não responder, ou se a API recusar o Pedido
   por Cotação desatualizada, então o fluxo de Compra não deve confirmar o Pedido e deve
   informar ao colecionador que o total não pôde ser revalidado, sem perder os itens do
   Carrinho.

## Cenários (BDD)

```gherkin
Cenário: preço sobe enquanto o colecionador navega
Dado um Carrinho com Cotação aceita de 0,75 ETH + taxa, em que um NFT custava 0,45 ETH
Quando o colecionador pede para confirmar e a Cotação nova traz esse NFT a 0,52 ETH
Então o Pedido não é enviado e o Carrinho mostra "0,45 ETH → 0,52 ETH" com o novo total para aceitar
```

```gherkin
Cenário: edição esgota antes da confirmação
Dado um Carrinho com Cotação aceita contendo dois NFTs
Quando o colecionador pede para confirmar e a Cotação nova indica que a edição de um deles esgotou
Então o Pedido não é enviado e o Carrinho mostra qual item esgotou antes de abrir a carteira
```

```gherkin
Cenário: Cotação nova não responde
Dado um Carrinho com Cotação aceita
Quando o colecionador pede para confirmar e a Cotação nova não responde
Então nenhum Pedido é confirmado e o colecionador vê que o total não pôde ser revalidado, com os itens mantidos
```

## Como eu vou saber que funcionou

Os 3 cenários acima rodam como testes (runner BDD da semana 8) e passam. Além disso, nenhum
teste consegue chegar a um Pedido confirmado cujo total seja diferente da última Cotação aceita.

## Linguagem ubíqua usada aqui

| Termo | O que significa neste projeto |
|---|---|
| Carrinho | Os itens (NFT + edição + quantidade inteira) que o colecionador separou. Sobrevive a refresh e preserva os itens do visitante ao autenticar. |
| Cotação | A resposta da API com disponibilidade, cupom, descontos, taxas e total. É a referência para finalizar; Cotação desatualizada não confirma compra. |
| Pedido | A tentativa de compra enviada com chave de idempotência: pendente, confirmado ou recusado (os dois últimos são terminais). |
| Recibo | O snapshot do Pedido confirmado. Mudanças posteriores no catálogo não alteram os valores dele. |
| Preço | Na Compra, é o valor combinado na Cotação aceita. No Catálogo, é o valor atual, que pode mudar a qualquer momento. |
