'use client'
import { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dropsToXrp } from 'xrpl/dist/npm/utils'

import { AuthContext } from './authContext'
import { TokenContext } from './tokenContext'

import { CurrencyAmount, PathOption } from '@/@types/xrpl'
import { usePathFind } from '@/hooks/usePathFind'
import { parseCurrencyToAmount } from '@/utils/xrpl'

type Currencies = { from: CurrencyAmount; to: CurrencyAmount }
type ContextState = {
  currencies: Currencies
  setCurrencyFrom: (currency: CurrencyAmount) => void
  setCurrencyTo: (currency: CurrencyAmount) => void
  setValueFrom: (value: number) => void
  setValueTo: (value: number) => void
  switchCurrencies: () => void
  pathLoading: boolean
  bestRoute: PathOption | null
  isFullPath: boolean | undefined
  bestPrice: number
  swapPrice: number
  refetch: () => void
}

export const SwapContext = createContext<ContextState>({} as any)

const SwapContextProvider: FC<{ children: React.ReactElement }> = ({ children }) => {
  const { state } = useContext(AuthContext)
  const { currencies: userCurrencies, refetch } = useContext(TokenContext)
  const [currencies, setCurrencies] = useState<Currencies>({
    from: { ...userCurrencies[0], value: 1 },
    to: { ...userCurrencies[1], value: 1 },
  })
  const { bestRoute, setAccount, setPathFrom, setPathTo, bestPrice, swapPrice, setPathfindEnable, isFullPath } =
    usePathFind({
      account: state?.account || '',
      from: parseCurrencyToAmount(currencies.from),
      to: parseCurrencyToAmount(currencies.to),
    })

  useEffect(() => {
    if (userCurrencies.length > 1) {
      setPathfindEnable()
    }
  }, [setPathfindEnable, userCurrencies.length])

  useEffect(() => {
    if (state?.account) {
      setAccount(state.account)
    }
  }, [setAccount, state?.account])

  useEffect(() => {
    setCurrencies({ from: { ...userCurrencies[0], value: 1 }, to: { ...userCurrencies[1], value: 1 } })
  }, [userCurrencies])

  useEffect(() => {
    setPathFrom(parseCurrencyToAmount(currencies.from))
    setPathTo(parseCurrencyToAmount(currencies.to))
  }, [currencies, setPathFrom, setPathTo])

  const getCurrencyBalance = useCallback(
    (currency: CurrencyAmount) => {
      return userCurrencies.find((c) => c.issuer === currency.issuer && c.currency === currency.currency)!
    },
    [userCurrencies]
  )

  const setCurrencyFrom = (currency: Omit<CurrencyAmount, 'value'>) => {
    const currencyFrom: CurrencyAmount = {
      issuer: currency.issuer,
      currency: currency.currency,
      name: currency.name,
      value: Math.min(getCurrencyBalance({ ...currency, value: 0 }).balance, 1),
    }
    setCurrencies({ from: currencyFrom, to: currencies.to })
  }

  const setCurrencyTo = (currency: CurrencyAmount) => {
    const currencyTo: CurrencyAmount = {
      issuer: currency.issuer,
      currency: currency.currency,
      name: currency.name,
      value: 0,
    }
    setCurrencies({ from: currencies.from, to: currencyTo })
  }

  const setValueFrom = (value: number) => {
    // if value is bigger than token balance, set balance
    const currencyFrom = { ...currencies.from, value: Math.min(getCurrencyBalance(currencies.from).balance, value) }
    const currencyTo = currencies.to
    if (currencyFrom.value === 0) {
      currencyTo.value = 0
      setCurrencies({ from: currencyFrom, to: currencyTo })
    } else {
      setCurrencies({ from: currencyFrom, to: currencyTo })
    }
  }

  const setValueTo = (value: number) => {
    const currencyFrom = currencies.from
    const currencyTo = { ...currencies.to, value }
    setCurrencies({ from: currencyFrom, to: currencyTo })
  }

  const switchCurrencies = () => {
    setCurrencies({
      from: {
        ...currenciesResult.to,
        value: Math.min(getCurrencyBalance(currencies.to).balance, currenciesResult.to.value || 1),
      },
      to: { ...currenciesResult.from, value: 0 },
    })
  }

  const currenciesResult = useMemo((): Currencies => {
    const bestRouteValue =
      typeof bestRoute?.destination_amount === 'string'
        ? dropsToXrp(bestRoute.destination_amount)
        : bestRoute?.destination_amount.value
    const destValue = bestRouteValue !== undefined ? parseFloat(parseFloat(bestRouteValue).toFixed(6)) : undefined
    return {
      ...currencies,
      to: {
        ...currencies.to,
        value: destValue || currencies.to.value,
      },
    }
  }, [bestRoute, currencies])

  const pathLoading = useMemo(() => isFullPath === undefined, [isFullPath])

  return (
    <SwapContext.Provider
      value={{
        currencies: currenciesResult,
        setCurrencyFrom,
        setCurrencyTo,
        setValueFrom,
        setValueTo,
        switchCurrencies,
        pathLoading,
        bestRoute,
        isFullPath,
        bestPrice: parseFloat(bestPrice.toFixed(6)),
        swapPrice: parseFloat(swapPrice.toFixed(6)),
        refetch,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}
export default SwapContextProvider
