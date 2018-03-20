import RpcProvider from '@src/providers/rpc';
export * from './providerManager';
export * from './providerProxy';
export * from './providerStorage';
export const allRPCMethods: (keyof RpcProvider)[] = [
  'ping',
  'sendCallRequest',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getCurrentBlock',
  'sendRawTx',
];
