import { shepherd } from '@src/';
import { IProviderConfig } from '@src/ducks/providerConfigs/types';
import { DATA_20B } from 'eth-rpc-types';

const myProviderConfig: IProviderConfig = {
  // size of the worker pool / maximum concurrent requests
  concurrency: 4,
  network: 'ETH',
  // how many failures before provider is considered offline
  requestFailureThreshold: 3,
  // supported methods to pass on to the provider to process
  supportedMethods: {
    getNetVersion: true,
    ping: true,
    sendCallRequest: true,
    sendCallRequests: true,
    getBalance: true,
    estimateGas: true,
    getTransactionCount: true,
    getCurrentBlock: true,
    sendRawTx: true,

    getTransactionByHash: true,
    getTransactionReceipt: true,

    /*web3 methods*/
    signMessage: true,
    sendTransaction: true,
  },
  // maximum time until a request is considered timed out
  timeoutThresholdMs: 5000,
};

async function main() {
  // initialize the balancer, returning a provider singleton instance to use throughout your application
  const provider = await shepherd.init({
    network: 'ETH', // the network for the balancer to use
    providerCallRetryThreshold: 4, // how many times a rpc call will be retried until its considered a failed call
  });

  // add a provider to be used with the balancer
  shepherd.useProvider(
    'rpc',
    'myLocalParityNode',
    myProviderConfig,
    'http://localhost:8545',
  );

  // add a second provider to be balanced with on the same network "ETH"
  shepherd.useProvider(
    'rpc',
    'myLocalParityNode2',
    myProviderConfig,
    'http://localhost:8546',
  );

  // switch balancer to manual mode, from now on every request will be processed by "myLocalParityNode"
  // if the manual provider to switch to is on a different network, the balancer will switch networks for you
  // automatically
  await shepherd.manual('myLocalParityNode', true);

  // make an rpc call
  console.log(
    await provider
      .getBalance('0x829BD824B016326A401d083B33D092293333A830' as any)
      .then(
        result =>
          `Balance of 0x829BD824B016326A401d083B33D092293333A830: ${result}`,
      )
      .catch(err => `Getting balance failed due to ${err.message}`),
  );

  // switch balancer back to auto mode
  // it will use all providers of its current network to balance across (default behaviour)
  shepherd.auto();

  // switch networks
  // only available when shepherd is in "auto" mode
  // note that we have to providers added with "ETC" in as their network
  // so any calls afterward will be flushed until a provider is added with "ETC" network
  // via shepherd.useProvider
  await shepherd.switchNetworks('ETC');
}

it(
  'should work',
  async () => {
    await main();
  },
  7000,
);
