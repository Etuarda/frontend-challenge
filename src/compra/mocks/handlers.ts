import { delay, http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { CriarPedidoCorpo, ErroApi, NftAtualizadoEvento, Pedido, PedirCotacaoCorpo } from '../contratos'
import { EVENTO_NFT_ATUALIZADO } from '../contratos'
import { CAMINHO_TEMPO_REAL, URL_TEMPO_REAL } from '../enderecoTempoReal'
import { calcularCotacao, proximoId, servidor } from './db'

const LATENCIA_MS = 150

function erro(status: number, codigo: string, mensagem: string): Response {
  return HttpResponse.json({ codigo, mensagem } satisfies ErroApi, { status })
}

export const handlersRest = [
  http.get('/api/carrinho', async () => {
    await delay(LATENCIA_MS)
    return HttpResponse.json(servidor.carrinho)
  }),

  http.post('/api/cotacoes', async ({ request }) => {
    await delay(LATENCIA_MS)
    if (servidor.cotacoesFalham) {
      return erro(503, 'cotacao_indisponivel', 'Serviço de Cotação indisponível')
    }
    const resultado = calcularCotacao((await request.json()) as PedirCotacaoCorpo)
    if ('erro' in resultado) return erro(422, 'cotacao_invalida', resultado.erro)
    return HttpResponse.json(resultado)
  }),

  http.post('/api/pedidos', async ({ request }) => {
    await delay(LATENCIA_MS)
    const chaveIdempotencia = request.headers.get('Idempotency-Key')
    if (!chaveIdempotencia) return erro(400, 'sem_idempotencia', 'Cabeçalho Idempotency-Key obrigatório')
    const corpo = (await request.json()) as CriarPedidoCorpo
    const id = proximoId('ped')
    servidor.pedidos.push({ id, chaveIdempotencia, corpo })
    return HttpResponse.json(
      { id, status: 'pendente', cotacaoId: corpo.cotacaoId, total: corpo.total } satisfies Pedido,
      { status: 201 },
    )
  }),
]

/* ---------- Tempo real: Socket.IO sobre o WebSocket interceptado pelo MSW ---------- */

type ConexaoSocketIo = ReturnType<typeof toSocketIo>
const conexoes = new Set<ConexaoSocketIo>()

const urlWebSocket = new URL(CAMINHO_TEMPO_REAL, URL_TEMPO_REAL)
urlWebSocket.protocol = urlWebSocket.protocol === 'https:' ? 'wss:' : 'ws:'
// O "*" final cobre a barra que o socket.io-client acrescenta (/tempo-real/?EIO=4...);
// a MSW remove a barra final do padrão antes de comparar.
const tempoReal = ws.link(`${urlWebSocket.href}*`)

export const handlersTempoReal = [
  tempoReal.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    conexoes.add(io)
    // Engine.IO v4: o servidor pinga ("2") e o cliente responde; sem isso o cliente
    // derruba a conexão após pingInterval + pingTimeout.
    const ping = setInterval(() => connection.client.send('2'), 20_000)
    connection.client.addEventListener('close', () => {
      clearInterval(ping)
      conexoes.delete(io)
    })
  }),
]

export function quantidadeDeConexoesTempoReal(): number {
  return conexoes.size
}

export function emitirNftAtualizado(evento: NftAtualizadoEvento): void {
  for (const io of conexoes) io.client.emit(EVENTO_NFT_ATUALIZADO, evento)
}
