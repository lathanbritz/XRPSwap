import { AccountInfoResponse, AccountObjectsResponse, dropsToXrp, ServerInfoResponse } from 'xrpl'
import { XrplClient } from 'xrpl-client'
import type { Trustline } from 'xrpl/dist/npm/models/methods/accountLines'

import { accountObjectsToAccountLines } from './accountObjectsToAccountLines'

import { TokensMarketData } from '@/@types/xrpl'

const endpoint = process.env.NEXT_PUBLIC_XRPL_SERVER

export const client = new XrplClient(endpoint)
export const client2 = new XrplClient(endpoint)

type AccountObject = AccountObjectsResponse['result']['account_objects'][number]

type Balance = {
  value: string
  currency: string
  issuer?: string
}

const requestAll = async (request: any) => {
  let result: any[] = []
  let marker: string | undefined = undefined
  do {
    const json = (await client.send({
      ...request,
      limit: Infinity,
      marker,
      ledger_index: 'validated',
    })) as any
    marker = json.marker
    const collectKey = getCollectKeyFromCommand(request.command)
    if (!collectKey) {
      throw new Error(`no collect key for command ${request.command}`)
    }
    result = result.concat(json[collectKey])
  } while (marker)
  return result
}

// https://github.com/XRPLF/xrpl.js/blob/45963b70356f4609781a6396407e2211fd15bcf1/packages/xrpl/src/client/index.ts#L131
function getCollectKeyFromCommand(command: string): string | null {
  switch (command) {
    case 'account_channels':
      return 'channels'
    case 'account_lines':
      return 'lines'
    case 'account_objects':
      return 'account_objects'
    case 'account_tx':
      return 'transactions'
    case 'account_offers':
    case 'book_offers':
      return 'offers'
    case 'ledger_data':
      return 'state'
    default:
      return null
  }
}

function formatBalances(trustlines: Trustline[]): Balance[] {
  return trustlines.map((trustline) => ({
    value: trustline.balance,
    currency: trustline.currency,
    issuer: trustline.account,
  }))
}

export const getBalances = async (address: string): Promise<Balance[]> => {
  const xrpPromise = client
    .send({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    })
    .then((res) => res['account_data'].Balance as string)
  const accountObjectsPromise = requestAll({
    command: 'account_objects',
    account: address,
    type: 'state',
  }) as unknown as Promise<AccountObject[]>

  return Promise.all([xrpPromise, accountObjectsPromise]).then(([xrpBalance, accountObjects]) => {
    const balances: Balance[] = []
    const linesBalance = accountObjectsToAccountLines(address, accountObjects, true)
    const accountLinesBalance = formatBalances(linesBalance)
    if (xrpBalance !== '') {
      balances.push({ currency: 'XRP', value: dropsToXrp(xrpBalance) })
    }
    balances.push(...accountLinesBalance)
    return balances
  })
}

export const getAccountInfo = (address: string): Promise<AccountInfoResponse['result']> => {
  return client.send({
    command: 'account_info',
    account: address,
    ledger_index: 'validated',
  }) as any
}

export const getServerInfo = (): Promise<ServerInfoResponse['result']> => {
  return client.send({ command: 'server_info' }) as any
}

type TokensMarketDataOption = {
  page?: number
  per_page?: number
}
type TokensMarketDataResponse = {
  tokens: {
    currency: string
    issuer: string
    token_name?: string | null
    volume_token: number
    volume_usd: number
    num_trades: number
    market_cap: number
    last_trade_at: string
    price_mid_usd: number
    supply: number
    logo_file?: string | null
  }[]
}
export const getTokensMarketData = async (
  { page, per_page }: TokensMarketDataOption = { page: undefined, per_page: undefined }
): Promise<TokensMarketData[]> => {
  const param = new URLSearchParams({
    min_trades: '1',
    per_page: (per_page || 25).toString(),
    page: (page || 1).toString(),
  })
  const response = await fetch(`https://api.onthedex.live/public/v1/daily/tokens?${param}`, {
    next: { revalidate: 60 },
  })
  const json = (await response.json()) as TokensMarketDataResponse
  return (json?.tokens || []).map((token) => ({
    issuer: token.issuer,
    currency: token.currency,
    name: token.token_name || token.currency,
    volume: token.volume_usd,
    market_cap: token.market_cap,
    last_trade_at: token.last_trade_at,
    price: token.price_mid_usd,
    trades: token.num_trades,
    supply: token.supply,
    logo: token.logo_file || undefined,
  }))
}
