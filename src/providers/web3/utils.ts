import { providerStorage } from '@src/providers';
import Web3Provider from '@src/providers/web3';
import { AMBIENT_PROVIDER } from '@src/providers/constants';

export type Web3SetupReturn = {
  networkId: string;
};

export async function setupWeb3Provider() {
  if (!window) {
    throw Error('Not in browser enviroment');
  }
  const { web3 } = window as any;

  if (!web3 || !web3.currentProvider || !web3.currentProvider.sendAsync) {
    throw Error(
      'Web3 not found. Please check that MetaMask is installed, or that MyEtherWallet is open in Mist.',
    );
  }

  const Provider = providerStorage.getClass('AmbientProvider');
  const provider = new Provider() as Web3Provider;
  const networkId = await provider.getNetVersion();
  const accounts = await provider.getAccounts();

  if (!accounts.length) {
    throw Error('No accounts found in MetaMask / Mist.');
  }

  if (networkId === 'loading') {
    throw Error(
      'MetaMask / Mist is still loading. Please refresh the page and try again.',
    );
  }

  providerStorage.setInstance(AMBIENT_PROVIDER, provider);

  return { networkId };
}

export async function isWeb3ProviderAvailable(): Promise<boolean> {
  try {
    await setupWeb3Provider();
    return true;
  } catch (e) {
    return false;
  }
}
