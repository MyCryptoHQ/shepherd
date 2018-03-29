import * as BN from 'bn.js';
import { Wei } from '@src/utils';
import { ProviderBalancerState } from '@src/ducks/providerBalancer';
import { ProviderConfigState } from '@src/ducks/providerConfigs';

type DeepPartial<T> = Partial<{ [key in keyof T]: Partial<T[key]> }>;

// Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export interface IProviderContructor<T = any> {
  new (args?: T): IProvider;
}

export interface IProvider {
  ping(): Promise<boolean>;
  getBalance(address: string): Promise<Wei>;
  estimateGas(tx: Partial<IHexStrTransaction>): Promise<Wei>;
  getTransactionCount(address: string): Promise<string>;
  sendRawTx(tx: string): Promise<string>;
  sendCallRequest(txObj: TxObj): Promise<string>;
  getCurrentBlock(): Promise<string>;
}

export type StrIdx<T> = { [key: string]: T };

export type NumIdx<T> = { [key: number]: T };

export interface TxObj {
  to: string;
  data: string;
}

export interface IHexStrTransaction {
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  nonce: string;
  chainId: number;
}

export interface IHexStrWeb3Transaction {
  from: string;
  to: string;
  value: string;
  data: string;
  gas: string;
  gasPrice: string;
  nonce: string;
  chainId: number;
}

export interface RootState {
  providerBalancer: ProviderBalancerState;
  providerConfigs: ProviderConfigState;
}
