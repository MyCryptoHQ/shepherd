import { IProvider } from '@src/types';
import RpcProvider from './rpc';
import {
  IProviderCall,
  providerCallRequested,
  getProviderCallById,
} from '@src/ducks/providerBalancer/providerCalls';
import { store } from '@src/ducks';

const providerCallDispatcher = (() => {
  let callId = 0;
  return (rpcMethod: keyof RpcProvider) => (...rpcArgs: string[]) =>
    new Promise((resolve, reject) => {
      // allow all providers for now
      const providerCall: IProviderCall = {
        callId: ++callId,
        numOfTimeouts: 0,
        rpcArgs,
        rpcMethod,
        minPriorityProviderList: [],
      };

      // make the request to the load balancer
      const networkReq = providerCallRequested(providerCall);
      store.dispatch(networkReq);

      const unsubscribe = store.subscribe(() => {
        const state = store.getState();
        const providerCall = getProviderCallById(
          state,
          networkReq.payload.callId,
        );
        if (providerCall && !providerCall.pending) {
          providerCall.result
            ? resolve(providerCall.result)
            : reject(providerCall.error);
          return unsubscribe();
        }
      });
    });
})();

const handler: ProxyHandler<IProvider> = {
  get: (target, methodName: keyof RpcProvider) => {
    if (!Object.getOwnPropertyNames(target).includes(methodName)) {
      return target[methodName];
    }
    return providerCallDispatcher(methodName);
  },
};

export const createProviderProxy = () => new Proxy({} as IProvider, handler);
