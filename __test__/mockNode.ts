import { promisify } from 'util';
import { setTimeout } from 'timers';
import { generateMockCalls } from './generateTestData';
import { IProviderContructor } from '@src/types';

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

export const createMockProxyHandler = (args: IMockProxyHandlerArgs) => {
  const retObj = {
    get(target, propKey) {
      const { baseDelay, failureRate } = args;

      const shouldFail = !!Math.floor(Math.random() + failureRate / 100);
      const delayTime = baseDelay;

      const targetProperty = Reflect.get(target, propKey).bind(target);
      if (!targetProperty) {
        console.log('hi');
        return targetProperty;
      }

      return () => {
        // const logPrefix = `MockProvider.${propKey.toString()}`;
        if (shouldFail) {
          //console.log(`${logPrefix} Responding with failed call`);
          return setTimeoutAsync(delayTime).then(() => false);
        }

        //console.log(`${logPrefix} Responding with delay time ${delayTime}`);

        return setTimeoutAsync(delayTime).then(targetProperty);
      };
    },
  };

  return retObj;
};

export class MockProvider {
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
