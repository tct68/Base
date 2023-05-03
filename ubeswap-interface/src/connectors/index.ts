import { BaseTestnet } from '@celo-tools/use-contractkit'
import { ChainId, parseNetwork } from '@ubeswap/sdk'

const networkChainIDFromHostname: ChainId = window.location.hostname.includes('alfajores')
? ChainId.BaseMainnet
: ChainId.BaseGoerli

export const NETWORK_CHAIN_ID: ChainId = process.env.REACT_APP_CHAIN_ID
  ? parseNetwork(parseInt(process.env.REACT_APP_CHAIN_ID))
  : networkChainIDFromHostname

const chainIdToName = (chainId: ChainId): string => {
  switch (chainId) {
    case ChainId.BaseGoerli:
      return BaseTestnet.name
    case ChainId.BaseMainnet:
      return 'mainnet'
    default:
      return 'unknown'
  }
}

export const NETWORK_CHAIN_NAME: string = chainIdToName(NETWORK_CHAIN_ID)

console.log('Loading Ubeswap interface at', window.location.hostname, networkChainIDFromHostname, NETWORK_CHAIN_ID)
