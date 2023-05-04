import React from 'react';
import { isMobile } from 'react-device-detect';

import { ChainId, Provider } from './types';
import { isEthereumFromMetamask, isEthereumPresent } from './utils/ethereum';
import {
  ETHEREUM,
  LEDGER,
  METAMASK,
  PRIVATE_KEY,
  WALLETCONNECT,
} from './walletIcons';

export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
  lastUsedFeeCurrency: 'use-contractkit/last-used-fee-currency',
};

export enum SupportedProviders {
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'Private key',
  WalletConnect = 'WalletConnect',
}

export enum WalletTypes {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  Ledger = 'Ledger',
  Injected = 'Injected',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
}

export const PROVIDERS: {
  [K in SupportedProviders]: Provider;
} = {
  [SupportedProviders.WalletConnect]: {
    name: SupportedProviders.WalletConnect,
    type: WalletTypes.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    icon: WALLETCONNECT,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
  },
  [SupportedProviders.Ledger]: {
    name: SupportedProviders.Ledger,
    type: WalletTypes.Ledger,
    description: 'Sync with your Ledger hardware wallet',
    icon: LEDGER,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 0,
  },
  [SupportedProviders.MetaMask]: {
    name: SupportedProviders.MetaMask,
    type: WalletTypes.MetaMask,
    description: isMobile ? (
      isEthereumFromMetamask() ? (
        'Connect with MetaMask Mobile App'
      ) : (
        'Open MetaMask Mobile App'
      )
    ) : (
      <>
        Use the Metamask browser extension. Celo support is limited.{' '}
        <a
          href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
          target="_blank"
          onClick={(e: any) => {
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
          }}
          className="tw-underline tw-text-gray-900 dark:tw-text-gray-200 tw-font-medium"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </>
    ),
    icon: METAMASK,
    canConnect: () => isEthereumFromMetamask(),
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://metamask.app.link/',
  },
  [SupportedProviders.Injected]: {
    name: SupportedProviders.Injected,
    type: WalletTypes.Injected,
    description: 'Connect any Ethereum wallet to Celo',
    icon: ETHEREUM,
    canConnect: () => isEthereumPresent(),
    showInList: () => isEthereumFromMetamask(),
    listPriority: () => 1,
  },
  [SupportedProviders.PrivateKey]: {
    name: SupportedProviders.PrivateKey,
    type: WalletTypes.PrivateKey,
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PRIVATE_KEY,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
    listPriority: () => 1,
  },
};

export const images = {
  [SupportedProviders.MetaMask]: METAMASK,
  [SupportedProviders.WalletConnect]: WALLETCONNECT,
  [SupportedProviders.Ledger]: LEDGER,
  [SupportedProviders.PrivateKey]: PRIVATE_KEY,
} as const;

export enum NetworkNames {
  BaseTestnet = 'BaseTestnet',
  BaseMainnet = 'BaseMainnet'
}

export const BaseTestnet = {
  name: NetworkNames.BaseTestnet,
  rpcUrl: 'https://goerli.base.org',
  // graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://goerli.basescan.org',
  chainId: ChainId.BaseTestnet,
} as const;

export const BaseMainnet = {
  name: NetworkNames.BaseMainnet,
  rpcUrl: 'https://goerli.base.org',
  // graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://goerli.basescan.org',
  chainId: ChainId.BaseMainnet,
} as const;

export enum WalletIds {
  Valora = 'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974',
  CeloWallet = '36d854b702817e228d5c853c528d7bdb46f4bb041d255f67b82eb47111e5676b',
  CeloTerminal = '8f8506b7f191a8ab95a8295fc8ca147aa152b1358bee4283d6ad2468d97e0ca4',
}

/**
 * These wallets cannot have their networks
 * updated via use-contractkit
 */
export const STATIC_NETWORK_WALLETS = [WalletTypes.MetaMask];

/**
 * Gets the provider associated with a wallet type.
 * @param wallet
 * @returns
 */
export const getProviderForWallet = (
  wallet: WalletTypes
): SupportedProviders | null =>
  wallet === WalletTypes.Unauthenticated ? null : SupportedProviders[wallet];

/**
 * Default networks to connect to.
 */
export const DEFAULT_NETWORKS = [
  BaseMainnet,
  BaseTestnet,
  ...(process.env.NODE_ENV !== 'production' ? [BaseTestnet] : []),
];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.BaseMainnet | ChainId.BaseTestnet;
