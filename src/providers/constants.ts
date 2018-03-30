import { AllProviderMethods } from '@src/types';

export const allRPCMethods: (AllProviderMethods)[] = [
  'ping',
  'getNetVersion',
  'sendCallRequest',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getTransactionReceipt',
  'getTransactionByHash',
  'getCurrentBlock',
  'sendRawTx',

  /*web3 specific methods */
  'sendTransaction',
  'signMessage',
];
