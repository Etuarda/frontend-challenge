import { expect, test, type Page } from '@playwright/test'
import type { ControleDosMocks } from '../src/compra/mocks/controle'
import type { PedidoRecebido } from '../src/compra/mocks/db'

/**
 * Cenários BDD de docs/revalidar-cotacao-antes-de-confirmar-pedido-spec.md.
 * REST passa pelos handlers MSW; as alterações chegam pelo socket.io-client, emitidas pelo
 * servidor Socket.IO simulado no MSW (window.__mocks só muda o "servidor" e emite o evento).
 */

type Alteracao = Parameters<ControleDosMocks['alterarEdicao']>[0]

const mocks = {
  alterarEdicao: (page: Page, alteracao: Alteracao) =>
    page.evaluate((a) => window.__mocks!.alterarEdicao(a), alteracao),
  falharCotacoes: (page: Page) => page.evaluate(() => window.__mocks!.falharCotacoes(true)),
  pedidosRecebidos: (page: Page): Promise<PedidoRecebido[]> =>
    page.evaluate(() => window.__mocks!.pedidosRecebidos()),
}

async function abrirCarrinhoComCotacaoAceita(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Resumo da Cotação aceita' })).toBeVisible()
  await expect(page.getByTestId('resumo-subtotal')).toContainText('0,75 ETH')
  await expect(page.getByTestId('tempo-real')).toHaveText('Alterações ao vivo: conectado')
}

const item = (page: Page, nome: string) =>
  page.getByRole('list', { name: 'Itens do Carrinho' }).getByRole('listitem', { name: nome })
const botaoConfirmar = (page: Page) => page.getByRole('button', { name: 'Confirmar pedido' })

test('preço sobe com o Carrinho aberto', async ({ page }) => {
  // Dado um Carrinho com Cotação aceita de subtotal 0,75 ETH, em que "Aurora #1" custa 0,45 ETH
  await abrirCarrinhoComCotacaoAceita(page)
  await expect(item(page, 'Aurora #1').getByTestId('preco-item')).toHaveText('0,45 ETH')

  // Quando chega a alteração do Preço de "Aurora #1" para 0,52 ETH
  await mocks.alterarEdicao(page, { nftId: 'aurora-1', edicaoId: 'ed-1', preco: '0.52' })

  // Então o Carrinho mostra "0,45 ETH → 0,52 ETH", o subtotal passa a 0,82 ETH
  await expect(item(page, 'Aurora #1').getByTestId('preco-item')).toHaveText('0,45 ETH → 0,52 ETH')
  await expect(page.getByRole('status').filter({ hasText: 'O Preço de Aurora #1 mudou de 0,45 ETH para 0,52 ETH.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Nova Cotação, aguardando aceite' })).toBeVisible()
  await expect(page.getByTestId('resumo-subtotal')).toContainText('0,82 ETH')
  await expect(page.getByTestId('resumo-subtotal')).toContainText('antes 0,75 ETH')

  // e a confirmação fica bloqueada até aceitar a nova Cotação
  await expect(botaoConfirmar(page)).toBeDisabled()
  await expect(page.getByText('A Cotação mudou. Aceite a nova Cotação para confirmar o Pedido.')).toBeVisible()

  await page.getByRole('button', { name: 'Aceitar nova Cotação' }).click()
  await expect(page.getByRole('heading', { name: 'Resumo da Cotação aceita' })).toBeVisible()
  await expect(botaoConfirmar(page)).toBeEnabled()

  // O Pedido só sai com a Cotação aceita (a nova), revalidada na confirmação.
  const totalAceito = (await page.getByTestId('resumo-total').locator('dd').textContent())!.trim()
  expect(totalAceito).toBe('0,822 ETH')
  await botaoConfirmar(page).click()
  await expect(page.getByText('Pedido enviado com o total de 0,822 ETH.')).toBeVisible()
  const pedidos = await mocks.pedidosRecebidos(page)
  expect(pedidos).toHaveLength(1)
  expect(pedidos[0].corpo.total).toBe('0.822')
})

test('edição esgota antes da confirmação', async ({ page }) => {
  // Dado um Carrinho com Cotação aceita contendo "Aurora #1" e "Maré #7"
  await abrirCarrinhoComCotacaoAceita(page)
  await expect(item(page, 'Aurora #1')).toBeVisible()
  await expect(item(page, 'Maré #7')).toBeVisible()

  // Quando chega a alteração de que a edição de "Maré #7" esgotou
  await mocks.alterarEdicao(page, { nftId: 'mare-7', edicaoId: 'ed-1', disponibilidade: 0 })

  // Então o Carrinho mostra "Maré #7" como esgotado
  await expect(item(page, 'Maré #7').getByText('Esgotado', { exact: true })).toBeVisible()
  await expect(item(page, 'Maré #7').getByText('Remova o item do Carrinho para continuar.')).toBeVisible()
  await expect(item(page, 'Aurora #1').getByText('Esgotado', { exact: true })).toHaveCount(0)

  // a confirmação fica bloqueada (e não há aceite enquanto houver item esgotado)
  await expect(botaoConfirmar(page)).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Aceitar nova Cotação' })).toBeDisabled()

  // e nenhum Pedido é enviado, nem tentando clicar
  await botaoConfirmar(page).click({ force: true })
  await expect(botaoConfirmar(page)).toBeDisabled()
  expect(await mocks.pedidosRecebidos(page)).toHaveLength(0)
})

test('a revalidação da Cotação falha na confirmação', async ({ page }) => {
  // Dado um Carrinho com Cotação aceita de subtotal 0,75 ETH
  await abrirCarrinhoComCotacaoAceita(page)

  // Quando o colecionador confirma e a API de Cotação responde com erro
  await mocks.falharCotacoes(page)
  await botaoConfirmar(page).click()

  // Então nenhum Pedido é enviado, ele vê "Não foi possível revalidar o total"
  await expect(page.getByRole('alert')).toContainText('Não foi possível revalidar o total')
  expect(await mocks.pedidosRecebidos(page)).toHaveLength(0)

  // e os 2 itens continuam no Carrinho
  await expect(page.getByRole('list', { name: 'Itens do Carrinho' }).getByRole('listitem')).toHaveCount(2)
  await expect(item(page, 'Aurora #1')).toBeVisible()
  await expect(item(page, 'Maré #7')).toBeVisible()
})
