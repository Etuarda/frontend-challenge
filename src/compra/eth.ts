import type { Eth } from './contratos'

const CASAS = 18
const UM_ETH = 10n ** BigInt(CASAS)
const FORMATO = /^\d+(\.\d{1,18})?$/

/** Converte "0.45" em wei (bigint), sem passar por number. */
export function ethParaWei(valor: Eth): bigint {
  if (!FORMATO.test(valor)) {
    throw new Error(`Valor em ETH inválido: "${valor}"`)
  }
  const [inteiro, fracao = ''] = valor.split('.')
  return BigInt(inteiro) * UM_ETH + BigInt(fracao.padEnd(CASAS, '0'))
}

/** Converte wei (bigint, não negativo) na string decimal canônica: "0.82", "1", "0.002". */
export function weiParaEth(wei: bigint): Eth {
  if (wei < 0n) {
    throw new Error('Valor em ETH negativo')
  }
  const inteiro = wei / UM_ETH
  const fracao = (wei % UM_ETH).toString().padStart(CASAS, '0').replace(/0+$/, '')
  return fracao ? `${inteiro}.${fracao}` : inteiro.toString()
}

/** Compara dois valores em ETH sem perder precisão ("0.5" é igual a "0.50"). */
export function mesmoValor(a: Eth, b: Eth): boolean {
  return ethParaWei(a) === ethParaWei(b)
}

/** Apresentação em pt-BR, com no mínimo 2 casas: "0.3" → "0,30 ETH", "0.822" → "0,822 ETH". Só formata; não faz conta. */
export function formatarEth(valor: Eth): string {
  const [inteiro, fracao = ''] = weiParaEth(ethParaWei(valor)).split('.')
  return `${inteiro},${fracao.padEnd(2, '0')} ETH`
}
