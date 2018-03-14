import { INITIAL_ROOT_STATE } from '@src/ducks';
import * as currentConfigActions from './actions';
import * as configActions from '../configs/actions';
import * as selectors from './selectors';
import currentConfigReducer from './reducer';
import { StrIdx } from '@src/types';

const states: StrIdx<any> = {};

const stateAssigner = (reducerResult: any) => {
  const stateCopy: typeof INITIAL_ROOT_STATE = JSON.parse(
    JSON.stringify(INITIAL_ROOT_STATE),
  );
  stateCopy.providerConfigs.currentId = reducerResult;
  return stateCopy;
};

describe('Current id provider config tests', () => {
  describe('Selectors on initial state tests', () => {
    it('should select null on initial state', () => {
      expect(selectors.getCurrentProviderId(INITIAL_ROOT_STATE)).toEqual(null);
    });
  });

  describe('Action/Selector tests', () => {
    it('should handle a current provider config switch', () => {
      const action = currentConfigActions.switchCurrentProviderConfig({
        id: 'mock1',
      });
      const selector = selectors.getCurrentProviderId;
      states.switchCurrentProviderConfig = currentConfigReducer(
        undefined as any,
        action,
      );
      const state = stateAssigner(states.switchCurrentProviderConfig);

      expect(selector(state)).toEqual('mock1');
    });

    it('should handle a provider config remove', () => {
      const nullAction = configActions.removeProviderConfig({ id: 'mock1' });
      const selector = selectors.getCurrentProviderId;
      const nullState = stateAssigner(
        currentConfigReducer(states.switchCurrentProviderConfig, nullAction),
      );

      // when removing a config that is the current selected config, should be set to null
      expect(selector(nullState)).toEqual(null);

      // otherwise should stay
      const nonNullAction = configActions.removeProviderConfig({ id: 'mock2' });
      const nonNullState = stateAssigner(
        currentConfigReducer(states.switchCurrentProviderConfig, nonNullAction),
      );
      expect(selector(nonNullState)).toEqual('mock1');
    });
  });
});
