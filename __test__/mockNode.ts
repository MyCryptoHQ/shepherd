import { asyncTimeout } from '@test/utils';

interface IMockProxyHandlerArgs {
  failDelay?: number;
  getCurrentBlockDelay?: number;
  baseDelay: number; // ms
  failureRate: number; // %
  numberOfFailuresBeforeConnection?: number;
}

export const createMockProxyHandler = (args: IMockProxyHandlerArgs) => {
  let numFailed = 0;
  const retObj = {
    get(target: any, propKey: any) {
      const {
        baseDelay,
        failureRate,
        numberOfFailuresBeforeConnection,
        failDelay,
        getCurrentBlockDelay,
      } = args;

      const shouldFail = !!Math.floor(Math.random() + failureRate / 100);
      const delayTime = baseDelay;

      const targetProperty = Reflect.get(target, propKey).bind(target);
      if (!targetProperty) {
        return targetProperty;
      }

      return () => {
        if (
          numberOfFailuresBeforeConnection &&
          numberOfFailuresBeforeConnection !== numFailed
        ) {
          numFailed++;
          return asyncTimeout(failDelay || delayTime).then(() => {
            throw Error('mock node error');
          });
        } else if (shouldFail && propKey.toString() !== 'getCurrentBlock') {
          return asyncTimeout(failDelay || delayTime).then(() => {
            throw Error('mock node error');
          });
        }

        if (propKey.toString() === 'getCurrentBlock') {
          return asyncTimeout(getCurrentBlockDelay || delayTime).then(
            targetProperty,
          );
        }

        return asyncTimeout(delayTime).then(targetProperty);
      };
    },
  };

  return retObj;
};

export class MockProvider {
  public ping() {
    return true;
  }
  public getBalance() {
    return true;
  }
  public estimateGas() {
    return true;
  }
  public getTransactionCount() {
    return true;
  }
  public sendTransaction() {
    return true;
  }
  public sendRawTx() {
    return true;
  }
  public sendCallRequest() {
    return true;
  }
  public getCurrentBlock() {
    return true;
  }
}
