import { IProvider } from '@src/types';
import RpcProvider from './rpc';
import {
  IProviderCall,
  providerCallRequested,
  PROVIDER_CALL,
  ProviderCallAction,
  ProviderCallFailedAction,
  ProviderCallSucceededAction,
  ProviderCallFlushedAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { store } from '@src/ducks';
import { allRPCMethods } from '@src/providers';
import { subscribeToAction } from '@src/saga/watchers/watchActionSubscription';
import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderStatsAction } from '@src/ducks/providerBalancer/providerStats';
import { ProviderConfigAction } from '@src/ducks/providerConfigs';
import { BalancerAction } from '@src/ducks/providerBalancer/balancerConfig';

const triggerOnMatchingCallId = (callId: number) => (
  action:
    | ProviderCallAction
    | WorkerAction
    | ProviderStatsAction
    | ProviderConfigAction
    | BalancerAction,
) => {
  // check if the action is a provider failed or succeeded call
  if (
    action.type === PROVIDER_CALL.FAILED ||
    action.type === PROVIDER_CALL.SUCCEEDED ||
    action.type === PROVIDER_CALL.FLUSHED
  ) {
    // make sure its the same call
    return action.payload.providerCall.callId === callId;
  }
};

type Resolve = (value?: {} | PromiseLike<{}> | undefined) => void;
type Reject = (reason?: any) => void;

const respondToCallee = (resolve: Resolve, reject: Reject) => (
  action:
    | ProviderCallFailedAction
    | ProviderCallSucceededAction
    | ProviderCallFlushedAction,
) => {
  if (action.type === PROVIDER_CALL.FLUSHED) {
    console.error('Request flushed');
    console.error(action);

    reject(Error(action.payload.error));
  } else if (action.type === PROVIDER_CALL.FAILED) {
    console.error('Request failed');
    console.error(action);

    reject(Error(action.payload.error));
  } else {
    resolve(action.payload.result);
  }
};

const generateCallId = (() => {
  let callId = 0;
  return () => {
    const currValue = callId;
    callId += 1;
    return currValue;
  };
})();

const makeProviderCall = (
  rpcMethod: keyof RpcProvider,
  rpcArgs: string[],
): IProviderCall => {
  // allow all providers for now
  const providerCall: IProviderCall = {
    callId: generateCallId(),
    numOfRetries: 0,
    rpcArgs,
    rpcMethod,
    minPriorityProviderList: [],
  };

  return providerCall;
};

const dispatchRequest = (providerCall: IProviderCall) => {
  // make the request to the load balancer
  const networkReq = providerCallRequested(providerCall);
  store.dispatch(networkReq);
  return networkReq.payload.callId;
};

const waitForResponse = (callId: number) =>
  new Promise((resolve, reject) =>
    subscribeToAction({
      trigger: triggerOnMatchingCallId(callId),
      callback: respondToCallee(resolve, reject),
    }),
  );

const providerCallDispatcher = (rpcMethod: keyof RpcProvider) => (
  ...rpcArgs: string[]
) => {
  const providerCall = makeProviderCall(rpcMethod, rpcArgs);
  const callId = dispatchRequest(providerCall);
  return waitForResponse(callId);
};

const handler: ProxyHandler<IProvider> = {
  get: (target, methodName: keyof RpcProvider) => {
    if (!allRPCMethods.includes(methodName)) {
      return target[methodName];
    }
    return providerCallDispatcher(methodName);
  },
};

export const createProviderProxy = () => new Proxy({} as IProvider, handler);
