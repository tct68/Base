import { ChainId } from '@ubeswap/sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'theme'

import { NETWORK_CHAIN_ID } from '../../connectors'
import { BaseTestnet } from '@celo-tools/use-contractkit'

const CELO_PARAMS = {
  chainId: '0xa4ec',
  chainName: 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://forno.celo.org'],
  blockExplorerUrls: ['https://explorer.celo.org/'],
  iconUrls: ['future'],
}

const ALFAJORES_PARAMS = {
  chainId: BaseTestnet.chainId,
  chainName: BaseTestnet.name,
  nativeCurrency: { name: 'Alfajores Celo', symbol: 'A-CELO', decimals: 18 },
  rpcUrls: [BaseTestnet.rpcUrl],
  blockExplorerUrls: [BaseTestnet.explorer],
  iconUrls: ['future'],
}

const params: { [chain in ChainId]: typeof CELO_PARAMS } = {
  [ChainId.BaseMainnet]: CELO_PARAMS,
  [ChainId.BaseGoerli]: ALFAJORES_PARAMS
}

export const CeloConnector: React.FC = () => {
  const { t } = useTranslation()
  const chainParams = params[NETWORK_CHAIN_ID]
  return (
    <Button
      onClick={async () => {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        })
      }}
    >
      {t('SwitchToThe')} {chainParams.chainName} {t('Network')}
    </Button>
  )
}
