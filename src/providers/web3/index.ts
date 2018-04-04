import { IHexStrWeb3Transaction, IProvider } from '@src/types';
import {
  isValidGetAccounts,
  isValidGetNetVersion,
  isValidSendTransaction,
  isValidSignMessage,
} from '@src/validators';
import { RPCProvider } from '../rpc';
import { Web3Client } from './client';
import { Web3Requests } from './requests';

export class Web3Provider extends RPCProvider {
  public client: Web3Client;
  public requests: Web3Requests;

  constructor() {
    super('web3'); // initialized with fake endpoint
    this.client = new Web3Client();
    this.requests = new Web3Requests();
  }

  public getNetVersion(): Promise<string> {
    return this.client
      .call(this.requests.getNetVersion())
      .then(isValidGetNetVersion)
      .then(({ result }) => result);
  }

  public sendTransaction(web3Tx: IHexStrWeb3Transaction): Promise<string> {
    return this.client
      .call(this.requests.sendTransaction(web3Tx))
      .then(isValidSendTransaction)
      .then(({ result }) => result);
  }

  public signMessage(msgHex: string, fromAddr: string): Promise<string> {
    return this.client
      .call(this.requests.signMessage(msgHex, fromAddr))
      .then(isValidSignMessage)
      .then(({ result }) => result);
  }

  public getAccounts(): Promise<string> {
    return this.client
      .call(this.requests.getAccounts())
      .then(isValidGetAccounts)
      .then(({ result }) => result);
  }
}

export function isWeb3Provider(
  provider: IProvider | Web3Provider,
): provider is Web3Provider {
  return provider instanceof Web3Provider;
}

export const Web3Service = 'MetaMask / Mist';

export async function setupWeb3Provider() {
  const { web3 } = window as any;

  if (!web3 || !web3.currentProvider || !web3.currentProvider.sendAsync) {
    throw new Error(
      'Web3 not found. Please check that MetaMask is installed, or that MyEtherWallet is open in Mist.',
    );
  }

  const provider = new Web3Provider();
  const networkId = await provider.getNetVersion();
  const accounts = await provider.getAccounts();

  if (!accounts.length) {
    throw new Error('No accounts found in MetaMask / Mist.');
  }

  if (networkId === 'loading') {
    throw new Error(
      'MetaMask / Mist is still loading. Please refresh the page and try again.',
    );
  }

  return { networkId, provider };
}

export async function isWeb3ProviderAvailable(): Promise<boolean> {
  try {
    await setupWeb3Provider();
    return true;
  } catch (e) {
    return false;
  }
}
