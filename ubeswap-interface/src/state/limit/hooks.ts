import { useContractKit } from '@celo-tools/use-contractkit'
import { parseUnits } from '@ethersproject/units'
import { CELO, cEUR, ChainId as UbeswapChainId, USDT, Fraction, Token, TokenAmount } from '@ubeswap/sdk'
import { useUbeswapTradeExactIn, useUbeswapTradeExactOut } from 'components/swap/routing/hooks/useTrade'
import { UbeswapTrade } from 'components/swap/routing/trade'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { tryParseAmount } from 'state/swap/hooks'
import { useCurrencyBalances } from 'state/wallet/hooks'

import { ROUTER_ADDRESS } from '../../constants'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import {
  Field,
  selectCurrency,
  setBuying as setBuyingAction,
  setRecipient,
  switchCurrencies,
  typeInput,
} from './actions'

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x85978fbFF09442d9e76c56bC69b155dd9a023376', // v2 factory
  '0xFbFaa130904BC964655e29f3fec12BafEEa4B885', // v2 router 02
  ROUTER_ADDRESS,
]

export function useLimitOrderState(): AppState['limit'] {
  return useSelector<AppState, AppState['limit']>((state) => state.limit)
}

// from the current limit order inputs, compute the trade
export function useDerivedLimitOrderInfo(): {
  currencies: { [field in Field]?: Token }
  currencyBalances: { [field in Field]?: TokenAmount }
  parsedInputTotal: TokenAmount | undefined
  parsedOutputTotal: TokenAmount | undefined
  v2Trade: UbeswapTrade | undefined
  inputError?: string
  showRamp: boolean
  buying: boolean
  marketPriceDiffIndicator: Fraction | undefined
  aboveMarketPrice: boolean | undefined
} {
  const { address: account, network } = useContractKit()

  const {
    priceTypedValue,
    tokenTypedValue,
    [Field.PRICE]: { currencyId: priceCurrencyId },
    [Field.TOKEN]: { currencyId: tokenCurrencyId },
    recipient,
    buying,
  } = useLimitOrderState()

  const priceCurrency = useCurrency(priceCurrencyId)
  const tokenCurrency = useCurrency(tokenCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    priceCurrency ?? undefined,
    tokenCurrency ?? undefined,
  ])

  // When buying, the buy asset
  const parsedTokenAmount = tryParseAmount(tokenTypedValue, tokenCurrency ?? undefined)
  const parsedPrice = tryParseAmount(priceTypedValue, priceCurrency ?? undefined)
  // When buying, the sell asset
  const parsedTokenOutput = parsedPrice
    ? tryParseAmount(
        parsedTokenAmount?.multiply(parsedPrice.numerator).divide(parsedPrice.denominator).toFixed(10),
        priceCurrency ?? undefined
      )
    : undefined

  const parsedInputTotal = buying ? parsedTokenOutput : parsedTokenAmount
  const parsedOutputTotal = buying ? parsedTokenAmount : parsedTokenOutput

  // Determine price as if we were trading 1 of the asset
  const buyTrade = useUbeswapTradeExactOut(
    priceCurrency ?? undefined,
    parsedTokenAmount
      ? new TokenAmount(parsedTokenAmount.currency, parseUnits('1', parsedTokenAmount.currency.decimals).toString())
      : undefined
  )
  const sellTrade = useUbeswapTradeExactIn(
    parsedTokenAmount
      ? new TokenAmount(parsedTokenAmount.currency, parseUnits('1', parsedTokenAmount.currency.decimals).toString())
      : undefined,
    priceCurrency ?? undefined
  )
  const v2Trade = buying ? buyTrade : sellTrade

  const currencyBalances = {
    [Field.PRICE]: relevantTokenBalances[0],
    [Field.TOKEN]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Token } = {
    [Field.PRICE]: priceCurrency ?? undefined,
    [Field.TOKEN]: tokenCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedTokenAmount) {
    inputError = inputError ?? 'Enter a token amount'
  } else if (!parsedPrice) {
    inputError = inputError ?? 'Enter a limit order price'
  }

  if (!currencies[Field.TOKEN] || !currencies[Field.PRICE]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    buying ? currencyBalances[Field.PRICE] : currencyBalances[Field.TOKEN],
    parsedInputTotal,
  ]

  let showRamp = false
  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    if (
      balanceIn.currency.address === USDT[network.chainId as unknown as UbeswapChainId].address ||
      balanceIn.currency.address === CELO[network.chainId as unknown as UbeswapChainId].address ||
      balanceIn.currency.address === cEUR[network.chainId as unknown as UbeswapChainId].address
    ) {
      showRamp = true
    }
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  //calculate difference between market price and limit order price for display
  const marketDiffFraction =
    v2Trade && parsedPrice
      ? new Fraction(
          parsedPrice?.numerator,
          buying ? v2Trade.executionPrice.invert().numerator : v2Trade.executionPrice.invert().denominator
        )
      : undefined
  const aboveMarketPrice = marketDiffFraction && marketDiffFraction.lessThan('1')
  const marketPriceDiffIndicator = marketDiffFraction
    ? aboveMarketPrice
      ? new Fraction('1', '1').subtract(marketDiffFraction).multiply(new Fraction('1000', '10'))
      : marketDiffFraction.subtract(new Fraction('1', '1')).multiply(new Fraction('1000', '10'))
    : undefined

  return {
    currencies,
    currencyBalances,
    parsedInputTotal,
    parsedOutputTotal,
    v2Trade: v2Trade ?? undefined,
    showRamp,
    inputError,
    buying,
    marketPriceDiffIndicator,
    aboveMarketPrice,
  }
}

export function useLimitOrderActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Token) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  setBuying: (buying: boolean) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Token) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  const setBuying = useCallback(
    (buying: boolean) => {
      dispatch(setBuyingAction({ buying }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    setBuying,
  }
}
