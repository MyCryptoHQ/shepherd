import BN from 'bn.js';
import { TokenValue, Wei, Address } from '@src/ethUnits';

// Diff / Omit taken from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

interface TokenBalanceResult {
  balance: TokenValue;
  error: string | null;
}

export interface INode {
  ping(): Promise<boolean>;
  getBalance(address: string): Promise<Wei>;
  estimateGas(tx: Partial<IHexStrTransaction>): Promise<Wei>;
  getTransactionCount(address: string): Promise<string>;
  sendRawTx(tx: string): Promise<string>;
  sendCallRequest(txObj: TxObj): Promise<string>;
  getCurrentBlock(): Promise<string>;
}

export interface TxObj {
  to: string;
  data: string;
}

export interface ITransaction {
  to: Address;
  from?: Address;
  value?: Wei | null;
  data?: Buffer | null;
  gasLimit: Wei;
  gasPrice: Wei;
  nonce: BN;
  chainId: number;
  v;
  r;
  s;
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
