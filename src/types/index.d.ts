import { Wei } from '@src/utils';
import { IProviderBalancerState } from '@src/ducks/providerBalancer';
import { IProviderConfigState } from '@src/ducks/providerConfigs';
import BN from 'bn.js';

export type DeepPartial<T> = Partial<{ [key in keyof T]: Partial<T[key]> }>;

export type Resolve = (value?: {} | PromiseLike<{}> | undefined) => void;

export type Reject = (reason?: any) => void;

export interface IProviderContructor<T = any> {
  new (args?: T): IProvider;
}

export interface IRPCProviderContructor<T = any> {
  new (args?: T): IRPCProvider;
}

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
  getBlockByNumber(txhash: string): Promise<IBlock>;
}

export interface IProvider extends IRPCProvider {
  /*Web3 methods*/
  sendTransaction(web3Tx: IHexStrWeb3Transaction): Promise<string>;
  signMessage(msgHex: string, fromAddr: string): Promise<string>;
}

export type AllProviderMethods = keyof IProvider;

export interface StrIdx<T> {
  [key: string]: T;
}

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

export interface IBlock {
  number: number | null;
  hash: string | null;
  parentHash: string;
  nonce: string | null;
  sha3Uncles: string;
  logsBloom: string | null;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: BN;
  totalDifficulty: BN;
  extraData: string;
  size: number;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
  transactions: string[];
  uncles: string[];
  minimumGasPrice?: number; // defined in RSKIP-09 - https://github.com/rsksmart/RSKIPs/blob/master/IPs/RSKIP09.md
}
