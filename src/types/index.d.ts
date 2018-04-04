import * as BN from 'bn.js';
import { Wei } from '@src/utils';
import { IProviderBalancerState } from '@src/ducks/providerBalancer';
import { IProviderConfigState } from '@src/ducks/providerConfigs';

type DeepPartial<T> = Partial<{ [key in keyof T]: Partial<T[key]> }>;

// Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export interface IProviderContructor<T = any> {
  new (args?: T): IProvider;
}
export interface IRPCProviderContructor<T = any> {
  new (args?: T): IRPCProvider;
}

export type Resolve = (value?: {} | PromiseLike<{}> | undefined) => void;
export type Reject = (reason?: any) => void;

export interface IRPCProvider {
  getNetVersion(): Promise<string>;
  ping(): Promise<boolean>;
  getBalance(address: string): Promise<Wei>;
  estimateGas(tx: Partial<IHexStrTransaction>): Promise<Wei>;
  getTransactionCount(address: string): Promise<string>;
  getTransactionByHash(txhash: string): Promise<TransactionData>;
  getTransactionReceipt(txhash: string): Promise<TransactionReceipt>;
  sendRawTx(tx: string): Promise<string>;
  sendCallRequest(txObj: TxObj): Promise<string>;
  sendCallRequests(txObj: TxObj[]): Promise<string[]>;
  getCurrentBlock(): Promise<string>;
}

export interface IProvider extends IRPCProvider {
  /*Web3 methods*/
  sendTransaction(web3Tx: IHexStrWeb3Transaction): Promise<string>;
  signMessage(msgHex: string, fromAddr: string): Promise<string>;
}

export type AllProviderMethods = keyof IProvider;

export type StrIdx<T> = { [key: string]: T };

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

export interface TransactionData {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: string;
  to: string;
  value: Wei;
  gasPrice: Wei;
  gas: Wei;
  input: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  cumulativeGasUsed: Wei;
  gasUsed: Wei;
  contractAddress: string | null;
  logs: string[];
  logsBloom: string;
  status: number;
}

export interface RootState {
  providerBalancer: IProviderBalancerState;
  providerConfigs: IProviderConfigState;
}
