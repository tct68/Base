import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import {
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
  WalletConnectConnector,
} from './connectors';

/**
 * Connectors for each wallet.
 */
export const CONNECTOR_TYPES: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x in WalletTypes]: new (n: Network, ...args: any[]) => Connector;
} = {
  [WalletTypes.Injected]: InjectedConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.MetaMask]: MetaMaskConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector
};
