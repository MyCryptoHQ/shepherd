import { promisify } from 'util';
import { setTimeout } from 'timers';
import { MockCall, generateMockCalls } from './generateTestData';
import { addProviderConfig, handler, store } from '../src';

interface State {
  ping: number;
  getBalance: number;
  estimateGas: number;
  getTransactionCount: number;
  sendRawTx: number;
  getCurrentBlock: number;
  sendCallRequest: number;
  totalCalls: number;
}
interface IMockProxyHandlerArgs {
  baseDelay: number; // ms
  failureRate: number; // %
}

const setTimeoutAsync = promisify(setTimeout);

type IMockProxyHandler = IMockProxyHandlerArgs & ProxyHandler<MockProvider>;

const createProxyHandler = (args: IMockProxyHandlerArgs): IMockProxyHandler => {
  const retObj: IMockProxyHandler = {
    ...args,
    get(target, propKey) {
      const targetProperty = Reflect.get(target, propKey).bind(target);

      if (!Object.getOwnPropertyNames(target).includes(propKey.toString())) {
        return targetProperty;
      }

      return (
        { shouldFail, delayTime } = {
          shouldFail: false,
          delayTime: 0,
        },
      ) => {
        const logPrefix = `MockProvider.${propKey.toString()}`;
        if (shouldFail) {
          console.log(`${logPrefix} Responding with failed call`);
          return setTimeoutAsync(delayTime).then(() => false);
        }

        console.log(`${logPrefix} Responding with delay time ${delayTime}`);

        return setTimeoutAsync(delayTime).then(targetProperty);
      };
    },
  };

  return retObj;
};

class MockProvider {
  public state: State = {
    ping: 0,
    getBalance: 0,
    estimateGas: 0,
    getTransactionCount: 0,
    sendCallRequest: 0,
    sendRawTx: 0,
    getCurrentBlock: 0,
    totalCalls: 0,
  };
  public ping() {
    this.state.ping++;
    return true;
  }
  public getBalance() {
    this.state.getBalance++;
    return true;
  }
  public estimateGas() {
    this.state.estimateGas++;
    return true;
  }
  public getTransactionCount() {
    this.state.getTransactionCount++;
    return true;
  }
  public sendRawTx() {
    this.state.sendRawTx++;
    return true;
  }
  public sendCallRequest() {
    this.state.sendCallRequest++;
    return true;
  }
  public getCurrentBlock() {
    this.state.getCurrentBlock++;
    return true;
  }
}

const createMockProvider = (args: IMockProxyHandlerArgs): MockProvider => {
  const instance = new MockProvider();
  return new Proxy(instance, createProxyHandler(args));
};

const provider = createMockProvider({
  baseDelay: 500,
  failureRate: 20,
});

const pProvider = new Proxy(provider, handler as any) as any;

addProviderConfig({
  id: 'hi',
  config: {
    isCustom: false,
    pLib: provider as any,
    lib: pProvider as any,
    network: 'ETH' as any,
    service: 'mock',
  },
});

addProviderConfig({
  id: 'hi1',
  config: {
    isCustom: false,
    pLib: provider as any,
    lib: pProvider as any,
    network: 'ETH' as any,
    service: 'mock',
  },
});

const runTestData = async () => {
  console.log(await provider.getCurrentBlock());

  const mockCalls = generateMockCalls(0);
  await setTimeoutAsync(2000);
  mockCalls.forEach(async c => {
    const res = await pProvider[c.rpcMethod](c).catch(e => {
      const state = store.getState();
      return e.message;
    });
    console.log(c.id, res);
  });
  await setTimeoutAsync(2000);
  const s = store.getState();
  return s;
};

runTestData();
