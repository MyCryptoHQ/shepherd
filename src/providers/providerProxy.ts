import { store } from '@src/ducks';
import { BalancerAction } from '@src/ducks/providerBalancer/balancerConfig';
import { getManualMode } from '@src/ducks/providerBalancer/balancerConfig/selectors';
import {
  IProviderCall,
  PROVIDER_CALL,
  ProviderCallAction,
  ProviderCallFailedAction,
  ProviderCallFlushedAction,
  providerCallRequested,
  ProviderCallSucceededAction,
} from '@src/ducks/providerBalancer/providerCalls';
import { ProviderStatsAction } from '@src/ducks/providerBalancer/providerStats';
import { WorkerAction } from '@src/ducks/providerBalancer/workers';
import { ProviderConfigAction } from '@src/ducks/providerConfigs';
import { allRPCMethods } from '@src/providers';
import { subscribeToAction } from '@src/saga/watchers/watchActionSubscription';
import { IProvider } from '@src/types';
import RpcProvider from './rpc';

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
  if (action.type === PROVIDER_CALL.SUCCEEDED) {
    resolve(action.payload.result);
  } else {
    reject(Error(action.payload.error));
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
  const isManual = getManualMode(store.getState());

  const providerCall: IProviderCall = {
    callId: generateCallId(),
    numOfRetries: 0,
    rpcArgs,
    rpcMethod,
    minPriorityProviderList: [],
    ...(isManual ? { providerWhiteList: [isManual] } : {}),
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
