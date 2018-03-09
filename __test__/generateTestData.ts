import RpcProvider from '@src/providers/rpc';

// create a list of providers
// create a list of calls to make, with various delay times and failure rates
// pre-calculate how many calls each provider should make and make sure they're the same

export interface MockCall {
  shouldFail: boolean;
  delayTime: number; // ms
  id: number;
  rpcMethod: keyof RpcProvider;
  rpcArgs: string[];
}

const allMethods: (keyof RpcProvider)[] = [
  'ping',
  'sendCallRequest',
  'getBalance',
  'estimateGas',
  'getTransactionCount',
  'getCurrentBlock',
  'sendRawTx',
];

export const generateMockCalls = (failureRate: number = 50): MockCall[] => {
  const res: MockCall[] = [];
  for (let index = 0; index < 10; index++) {
    const methodIdxToCall = Math.floor(Math.random() * allMethods.length);
    const call: MockCall = {
      delayTime: 500 + Math.random() * 50,
      id: index,
      rpcMethod:
        allMethods[
          methodIdxToCall === allMethods.length
            ? allMethods.length - 1
            : methodIdxToCall
        ],
      rpcArgs: [],
      shouldFail: !!Math.floor(Math.random() + failureRate / 100),
    };
    res.push(call);
  }
  return res;
};
