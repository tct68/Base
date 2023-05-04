import { ChainId, Network, NetworkNames, BaseTestnet } from '@celo-tools/use-contractkit'

// We do an unsafe cast so we can use a custom network name
export const Mainnet: Network = {
  name: 'QNMainnet',
  rpcUrl: BaseTestnet.rpcUrl,
  // graphQl: 'https://explorer.celo.org/graphiql',
  explorer: BaseTestnet.explorer,
  chainId: ChainId.BaseMainnet,
} as unknown as Network

export const BaseTestNetwork: Network = {
  name: NetworkNames.BaseTestnet,
  rpcUrl: BaseTestnet.rpcUrl,
  // graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: BaseTestnet.explorer,
  chainId: ChainId.BaseTestnet,
}
