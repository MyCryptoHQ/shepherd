import { INITIAL_ROOT_STATE } from '@src/ducks';
import { IProviderConfig } from '@src/ducks/providerConfigs';
import { providerStorage } from '@src/providers';
import { StrIdx } from '@src/types';
import * as actions from './actions';
import { providerConfigs } from './reducer';
import * as selectors from './selectors';

const states: StrIdx<any> = {};

const stateAssigner = (reducerResult: any) => {
  const stateCopy: typeof INITIAL_ROOT_STATE = JSON.parse(
    JSON.stringify(INITIAL_ROOT_STATE),
  );
  stateCopy.providerConfigs = reducerResult;
  return stateCopy;
};

export const mockConfig: IProviderConfig = {
  concurrency: 3,
  network: 'ETH',
  requestFailureThreshold: 2,
  supportedMethods: {
    ping: true,
    sendCallRequest: true,
    getBalance: true,
    estimateGas: true,
    getTransactionCount: true,
    getCurrentBlock: true,
    sendRawTx: true,
  },
  timeoutThresholdMs: 1000,
};

describe('Provider config tests', () => {
  describe('Selectors on initial state tests', () => {
    it('should select undefined on a non-existing config', () => {
      expect(
        selectors.getProviderConfigById(INITIAL_ROOT_STATE, 'mock1'),
      ).toEqual(undefined);
    });
    it('should select an empty object on initial state', () => {
      expect(selectors.getProviderConfigs(INITIAL_ROOT_STATE)).toEqual({});
    });
  });
  describe('Action/Selector tests', () => {
    it('should handle adding a provider config', () => {
      const action = actions.addProviderConfig({
        id: 'mock1',
        config: mockConfig,
      });
      const selector = selectors.getProviderConfigById;
      states.providerConfigAdd = providerConfigs(undefined as any, action);
      const state = stateAssigner(states.providerConfigAdd);

      expect(selector(state, 'mock1')).toEqual(mockConfig);

      //handle duplicates
      expect(() => providerConfigs(states.providerConfigAdd, action)).toThrow(
        'Provider config mock1 already exists',
      );
    });

    it('should handle changing a provider config', () => {
      const action = actions.changeProviderConfig({
        id: 'mock1',
        config: { concurrency: 4 },
      });
      const selector = selectors.getProviderConfigById;

      states.providerConfigChange = providerConfigs(
        states.providerConfigAdd,
        action,
      );
      const state = stateAssigner(states.providerConfigChange);

      expect(selector(state, 'mock1')).toEqual({
        ...mockConfig,
        concurrency: 4,
      });

      //handle non existing config
      expect(() => providerConfigs(undefined as any, action)).toThrow(
        'Provider config mock1 does not exist',
      );
    });

    it('should handle changing a provider config -- merging supported methods', () => {
      const action = actions.changeProviderConfig({
        id: 'mock1',
        config: { supportedMethods: { estimateGas: false } },
      });
      const selector = selectors.getProviderConfigById;

      states.providerConfigChange = providerConfigs(
        states.providerConfigAdd,
        action,
      );
      const state = stateAssigner(states.providerConfigChange);

      expect(selector(state, 'mock1')).toEqual({
        ...mockConfig,
        supportedMethods: {
          ...mockConfig.supportedMethods,
          estimateGas: false,
        },
      });
    });

    it('should handle removing a provider config', () => {
      const action = actions.removeProviderConfig({ id: 'mock1' });
      const selector = selectors.getProviderConfigById;
      states.providerConfigRemove = providerConfigs(
        states.providerConfigChange,
        action,
      );

      const state = stateAssigner(states.providerConfigRemove);
      expect(selector(state, 'mock1')).toEqual(undefined);

      // handle non-existing config

      expect(() => providerConfigs(undefined as any, action)).toThrow(
        'Provider config mock1 does not exist',
      );
    });

    it('should handle getting a provider timeout threshold', () => {
      const state = stateAssigner(states.providerConfigAdd);
      const selector = selectors.getProviderTimeoutThreshold;
      expect(selector(state, 'mock1')).toEqual(1000);

      // throw on undefined
      expect(() => selector(state, 'mock12')).toThrow(
        'Could not find config for provider mock12',
      );
    });

    it('should get a provider instance and the timeout threshold', () => {
      const state = stateAssigner(states.providerConfigAdd);
      const selector = selectors.getProviderInstAndTimeoutThreshold;
      providerStorage.setInstance('mock1', {} as any);
      expect(selector(state, 'mock1')).toEqual({
        provider: {},
        timeoutThreshold: 1000,
      });
      // throw on undefined
      expect(() => selector(state, 'mock12')).toThrow(
        'mock12 instance does not exist in storage',
      );
    });
  });
});
