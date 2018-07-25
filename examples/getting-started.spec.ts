import { shepherd } from '@src/';
import { IProviderConfig } from '@src/ducks/providerConfigs/types';

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
    getBlockByNumber: true,

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

  // make an rpc call
  console.log(
    await provider
      .getBalance('0x829BD824B016326A401d083B33D092293333A830')
      .then(
        result =>
          `Balance of 0x829BD824B016326A401d083B33D092293333A830: ${result}`,
      )
      .catch(err => `Getting balance failed due to ${err.message}`),
  );
}

it(
  'should work',
  async () => {
    await main();
  },
  7000,
);
