import { ChainId, useContractKit } from '@celo-tools/use-contractkit'

export const useIsSupportedNetwork = () => {
  const { network } = useContractKit()

  return [ChainId.BaseMainnet, ChainId.BaseGoerli].includes(network.chainId)
}
