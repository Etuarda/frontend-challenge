# RESEARCH — O total do carrinho muda sem o colecionador saber

> **Sobre as fontes:** não há pessoa real entrevistada nem citação real. O papel, a jornada, a
> fala e os números abaixo são **reconstrução**, feita a partir do README do desafio (§3
> Carrinho, §3 Pagamento e confirmação, §7 cenário, §11) e do `GLOSSARIO.md`. Os valores em ETH
> são um **exemplo ilustrativo**, não estatística de mercado.

## Quem sente a dor

*(Papel reconstruído, sem pessoa nomeada.)*

O **colecionador que monta um carrinho com mais de um NFT de edições limitadas** e volta ao
catálogo para continuar escolhendo antes de pagar.

- Compra peças raras, de estoque pequeno, que podem esgotar a qualquer momento.
- Deixa o carrinho aberto por um tempo enquanto navega, e quanto mais tempo passa, maior a
  chance de algo mudar.
- Decide olhando o **total do carrinho**. Para ele, esse número é a promessa: aceita pagar
  aquilo, não "aquilo mais o que tiver mudado".

## Em que momento ela aparece

*(Jornada reconstruída.)*

1. O colecionador coloca 2 NFTs no carrinho: um de **0,45 ETH** e outro de **0,30 ETH**. O
   total é **0,75 ETH + taxa de rede**.
2. Ele volta ao catálogo, com o carrinho ainda aberto na mesma aba, procurando um terceiro
   NFT.
3. Passa **10 a 20 minutos** navegando. Nesse tempo, o NFT de 0,45 ETH sobe para **0,52 ETH**,
   ou a edição de um dos itens esgota.
4. Ninguém avisa. O carrinho continua mostrando o número antigo.
5. Ele vai para o pagamento e **só descobre a mudança na hora de assinar na carteira**, ou
   depois, no recibo. No pior caso, **não descobre nunca**.

A dor está no espaço entre **o total que ele aceitou no carrinho** e **o valor que é de fato
cobrado no fim**. Nas palavras do glossário: o *Preço* do Catálogo (valor atual) mudou, mas o
colecionador continua achando que vale o *Preço* da Compra (valor combinado na cotação que ele
aceitou).

O que mais dói, em ordem:

1. **O preço subir**: ele paga mais do que aceitou.
2. **A edição esgotar**: descobre no último passo que perdeu a peça.
3. **O preço cair**: dói menos, mas ele também quer saber, porque o total que vê deixou de
   ser verdade.

Outros pontos que o README pede para revalidar antes da confirmação: o cupom deixar de valer e
a taxa mudar (§3 Pagamento e confirmação).

## O que essa pessoa diria, com as próprias palavras

*(Fala reconstruída, não é citação.)*

> "Eu vi 0,75 ETH no carrinho. Por que a carteira está pedindo 0,82? Ninguém me avisou que
> mudou."

E, no caso de esgotar *(também reconstrução)*:

> "Passei vinte minutos montando esse carrinho e só agora, na hora de pagar, descubro que a
> peça acabou?"

## O que isso custa hoje

*(Valores do exemplo reconstruído, não números de mercado.)*

| Custo | Para quem | Tamanho no exemplo |
|---|---|---|
| Pagar mais sem perceber (**pior caso**) | Colecionador | 0,45 → 0,52 ETH = **+0,07 ETH, ~9% do total** de 0,75 ETH |
| Perder a edição esgotada no último passo (**segundo pior**) | Colecionador | os **10–20 min** gastos montando o carrinho, mais a busca por outra peça |
| Remontar o carrinho | Colecionador | o tempo de montar o carrinho de novo (sem medição) |
| Total que não bate com a soma dos itens | Colecionador | ex.: somar 0,10 + 0,20 e ver um total com casas a mais que não fecha em 0,30, ou um recibo com diferença mínima em relação ao que ele aceitou. A diferença é pequena, mas ele deixa de confiar no total |
| Desistência e perda de confiança | Marketplace | sem número |
| Confirmar compra com valor errado | Marketplace | o README trata "compra confirmada sem resposta da simulação" como **eliminatório** (§11). Confirmar com valor errado é a falha mais grave do fluxo |

O que ainda não sabemos: com que frequência o preço ou a disponibilidade muda durante uma sessão
de compra, e quanto da desistência vem disso.

## O que já foi tentado (se algo foi)

*(Comportamento reconstruído.)*

- **O próprio colecionador confere de novo** o preço de cada item antes de pagar.
- **Recarrega a página** para ver se algo mudou.

**Por que não resolve:** é manual, cansa e chega atrasado. Se a mudança acontece no último
segundo, entre a conferência e a assinatura, ele paga o valor novo do mesmo jeito. E o
colecionador que não sabe que precisa conferir fica sem proteção nenhuma.

Não há caso real de outro marketplace para citar.

## Ligação com a semana 5

Esta dor vive no contexto **Compra**, confirmado no `GLOSSARIO.md`, que é o núcleo do projeto.

Termos do glossário que aparecem aqui: **Carrinho**, **Cotação**, **Pedido** e **Recibo**. A
dor mora na palavra **Preço**, que muda de sentido entre os contextos: no **Catálogo** é o valor
atual, que pode mudar a qualquer momento; na **Compra** é o valor combinado na cotação aceita. A
dor nasce quando os dois divergem e o colecionador não fica sabendo.

---

## Checklist de saída da sessão de Research

- [x] Não tem nenhuma palavra de solução técnica neste arquivo (nome de lib, de tabela, de
      endpoint). Se tiver, apague — isso é trabalho da sessão de Plan.
- [x] Uma pessoa que não conhece o seu projeto consegue ler isto e entender o problema.
- [ ] Você conseguiria mostrar este arquivo pra pessoa que sente a dor e ela diria "é
      isso mesmo" — não "não é bem assim". *(Pendente: ainda não há colecionador real
      para validar. Papel, fala e números são reconstrução.)*
