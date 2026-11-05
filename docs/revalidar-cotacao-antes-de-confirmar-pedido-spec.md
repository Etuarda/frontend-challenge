# Revalidação da Cotação antes de confirmar o Pedido — spec

**Bounded context (semana 5):** Compra (`src/compra/`)
**ADR relacionada:** [`docs/adr/0001-revalidar-cotacao-antes-de-confirmar-pedido.md`](adr/0001-revalidar-cotacao-antes-de-confirmar-pedido.md)
**Escala:** M — muda o contrato entre o total mostrado ao colecionador e o valor cobrado

## Contexto

O colecionador coloca no Carrinho um NFT de 0,45 ETH e outro de 0,30 ETH (subtotal de 0,75 ETH)
e volta ao catálogo por 10 a 20 minutos. Enquanto isso, o primeiro sobe para 0,52 ETH, ou a
edição esgota, e ninguém avisa. O Carrinho continua mostrando o número antigo, e ele só descobre
na carteira, no Recibo ou nunca: *"Eu vi 0,75 ETH no carrinho. Por que a carteira está pedindo
0,82? Ninguém me avisou que mudou."* O que mais dói, em ordem: o preço subir, a edição esgotar
e o preço cair. Conferir à mão não resolve, porque a mudança pode vir no último segundo.
*(Papel, fala e números são reconstrução. Ver RESEARCH.md.)*

## Decisão

A Compra tem duas defesas. **Com o Carrinho aberto**, cada alteração de Preço ou
disponibilidade que chega é mostrada na hora, item por item (valor antigo → novo), o resumo é
atualizado e a Cotação aceita passa a valer como desatualizada. **Na confirmação**, o fluxo pede
uma Cotação nova à API e só envia o Pedido se ela bater com a Cotação aceita; se não bater, ou se
não houver resposta, o Pedido não é enviado e o colecionador precisa aceitar a nova Cotação.

## Fora de escopo

- Reservar a edição ou congelar o Preço quando o item entra no Carrinho.
- Avisar alterações fora do Carrinho (no catálogo ou no detalhe do NFT).
- Pagamento, carteira, idempotência e Recibo: o Pedido é só enviado ou não enviado aqui.
- Medir com que frequência o Preço ou a disponibilidade mudam (pergunta aberta do RESEARCH.md).
- Sugerir outra peça quando a edição esgota.

## Critérios (EARS)

Cada critério aponta a frase do RESEARCH.md e a seção do README de onde veio.

| # | Critério | Frase do RESEARCH.md | README |
|---|---|---|---|
| 1 | **Ubíqua:** O fluxo de Compra deve enviar o Pedido somente com a Cotação aceita pelo colecionador, e todo valor do resumo do Carrinho deve vir de uma Cotação da API, nunca de conta feita na tela. | "Decide olhando o total do carrinho. Para ele, esse número é a promessa" | §3 Carrinho: "A cotação da API é a referência para finalizar o pedido" |
| 2 | **Orientada a evento:** Quando chegar uma alteração de Preço ou disponibilidade de um NFT que está no Carrinho aberto, o Carrinho deve avisar a alteração, mostrar o valor antigo e o novo do item e atualizar o resumo. | "Ninguém avisa. O carrinho continua mostrando o número antigo." | §3 Carrinho: "Refletir alterações de preço e disponibilidade recebidas enquanto o carrinho estiver aberto"; §7 passos 1–3 |
| 3 | **Orientada a estado:** Enquanto a Cotação aceita estiver desatualizada, o fluxo de Compra deve manter a confirmação do Pedido bloqueada até o colecionador aceitar a nova Cotação. | "só descobre a mudança na hora de assinar na carteira" | §7 passo 4: "O checkout impede a confirmação com uma cotação desatualizada"; §3 Pagamento: "Mudanças devem exigir nova confirmação do usuário" |
| 4 | **Feature opcional:** Onde o Carrinho tiver cupom aplicado, o fluxo de Compra deve revalidar o cupom na Cotação nova e, se ele deixou de valer, tratar isso como divergência antes da confirmação. | "Outros pontos que o README pede para revalidar [...]: o cupom deixar de valer" | §3 Pagamento: "Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra" |
| 5 | **Comportamento indesejado:** Se a revalidação da Cotação falhar ou não responder, então o fluxo de Compra não deve enviar o Pedido, deve informar que o total não pôde ser revalidado e deve manter os itens do Carrinho. | "Confirmar compra com valor errado [...] é a falha mais grave do fluxo" | §3 Pagamento: "Preservar os itens em falhas"; §11: "compra confirmada sem resposta da simulação" é eliminatório |

### Respostas às perguntas da sessão 3 (Implement)

1. **Entre a alteração e o aceite:** quando a alteração chega, o fluxo pede uma Cotação nova à
   API e o resumo mostra essa Cotação como "nova Cotação, aguardando aceite", com o valor antigo
   ao lado (ex.: subtotal 0,82 ETH, antes 0,75 ETH). Nada é recalculado na tela (§3 Carrinho:
   "A cotação da API é a referência").
2. **Aceitar:** aceitar é aceitar a Cotação nova que está na tela. A confirmação revalida de
   novo de qualquer forma (critério 5 e decisão da ADR).
3. **Bater com a aceita:** itens (Preço e disponibilidade de cada um), cupom, taxa e total,
   todos iguais. Só o total igual não basta.
4. **Item esgotado:** enquanto houver item esgotado, não há aceite nem confirmação; o Carrinho
   pede para remover o item. Remover item é de outra spec (README §3 Carrinho), fora deste escopo.

## Cenários (BDD)

```gherkin
Cenário: preço sobe com o Carrinho aberto
Dado um Carrinho com Cotação aceita de subtotal 0,75 ETH, em que o NFT "Aurora #1" custa 0,45 ETH
Quando chega a alteração do Preço de "Aurora #1" para 0,52 ETH
Então o Carrinho mostra "0,45 ETH → 0,52 ETH", o subtotal passa a 0,82 ETH e a confirmação fica bloqueada até aceitar a nova Cotação
```

```gherkin
Cenário: edição esgota antes da confirmação
Dado um Carrinho com Cotação aceita contendo "Aurora #1" e "Maré #7"
Quando chega a alteração de que a edição de "Maré #7" esgotou
Então o Carrinho mostra "Maré #7" como esgotado, a confirmação fica bloqueada e nenhum Pedido é enviado
```

```gherkin
Cenário: a revalidação da Cotação falha na confirmação
Dado um Carrinho com Cotação aceita de subtotal 0,75 ETH
Quando o colecionador confirma e a API de Cotação responde com erro
Então nenhum Pedido é enviado, o colecionador vê "Não foi possível revalidar o total" e os 2 itens continuam no Carrinho
```

## Como eu vou saber que funcionou

`npx playwright test` roda os 3 cenários de cima, com a API e as alterações simuladas na camada
de rede, e todos passam. Nenhum teste chega a um Pedido enviado com total diferente da Cotação
aceita.

## Linguagem ubíqua usada aqui

| Termo | O que significa neste projeto |
|---|---|
| Carrinho | Os itens (NFT + edição + quantidade inteira) que o colecionador separou. Sobrevive a refresh e preserva os itens do visitante ao autenticar. |
| Cotação | A resposta da API com disponibilidade, cupom, descontos, taxas e total. É a referência para finalizar; Cotação desatualizada não confirma compra. |
| Pedido | A tentativa de compra enviada com chave de idempotência: pendente, confirmado ou recusado (os dois últimos são terminais). |
| Recibo | O snapshot do Pedido confirmado. Mudanças posteriores no catálogo não alteram os valores dele. |
| Preço | Na Compra, é o valor combinado na Cotação aceita. No Catálogo, é o valor atual, que pode mudar a qualquer momento. |
